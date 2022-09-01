import {Injectable} from '@pyrjs/core'
import { ClassicLevel } from 'classic-level';
import { ASTNode, ASTNodeType, QueryExpressionParser } from '../model/QueryExpressionParser';
import { QueryExpressionSemanticAnalyzer } from '../model/QueryExpressionSemanticAnalyzer';
import { QueryExpressionTokenizer, TokenType } from '../model/QueryExpressionTokenizer';
import { QueryInput } from '../model/Query';
import { GetItemInput } from '../model/GetItem';
import { UpdateItemInput } from '../model/UpdateItem';
import { PutItemInput } from '../model/PutItem';
import { DeleteItemInput } from '../model/DeleteItem';
import { ScanInput } from '../model/Scan';

@Injectable()
export class DatabaseService{
    
    private _db: ClassicLevel 

    constructor(){
        this._db = new ClassicLevel("./db.pyr", {valueEncoding: 'json'})
    }

    public async scan(scanInput?: ScanInput){


        let condition: any;
        let identifiers: string[] = [];

        if(scanInput?.FilterExpression){

            const tokenizer = new QueryExpressionTokenizer(scanInput.FilterExpression)

            const parser = new QueryExpressionParser(tokenizer.tokens)

            const filter = this._buildFilter(parser.tree, scanInput.FilterExpressionValues)

            condition = filter[0];
            identifiers = filter[1];

        }

        const items = []
        for await (const [key, value] of this._db.iterator<string, any>({valueEncoding: "json"}) ){


            if(condition){

                const params = identifiers.map((id) => value[id])

                if((condition as Function)(...params)){
                    items.push(value)
                }

                continue;

            }

            items.push(value)
   

        }

        return items

    }

    public async query(query: QueryInput){

        const tokenizer = new QueryExpressionTokenizer(query.SortKeyConditionExpression)

        const parser = new QueryExpressionParser(tokenizer.tokens)

        // build the query condition
        const condition = this._buildQuery(parser.tree, query.ExpressionValues)

        const partition = this._db.sublevel(query.PartitionKey as string);

        const items = [];

        for await (const [key, value] of partition.iterator<string, any>({valueEncoding: "json"}) ){

            if((condition as Function)(key)){
                items.push(value)
            }

        }


        return items;
   
    }

    private _buildFilter(root: ASTNode, filterValues: any): [Function, string[]]{


        const identifiers: string[] = [];

        let condition = '';

        const traverse = (node : ASTNode) => {


            switch(node.type){
                case ASTNodeType.COMPARISON:{
                    condition += `${node.left.data} === ${node.right.data}`


                    if(node.left.type === ASTNodeType.IDENTIFIER){
                        identifiers.push(node.left.data)
                    }

                    if(node.right.type === ASTNodeType.IDENTIFIER){
                        identifiers.push(node.left.data)
                    }


                    break;
                }
                case ASTNodeType.BINARY_EXPRESSION:{
                    traverse(node.left)
                    condition += node.data === "and" ? " && " : " || "
                    traverse(node.right)
                    break;
                }
                case ASTNodeType.FUNCTION_CALL:{

                    switch(node.data.function){
                        case 'begins_with':{
                            condition += `${node.data.params[0].value}.startsWith(${node.data.params[1].value})`
                            break;
                        }
                    }


                    if(node.left.type === ASTNodeType.IDENTIFIER){
                        identifiers.push(node.data.params[0].value)
                    }
                    

                }


            }

        }


        traverse(root.expression)

       for(const [key, value] of Object.entries(filterValues) as [string, any]){

        switch(typeof value){
            case 'number':{
                condition = condition.replace(key, `${value}`)
                break;
            }
            default: {
                condition = condition.replace(key, `"${value}"`)
            }
        }

       }

       return [new Function(...identifiers, `return (${condition})`), identifiers]

    }

    private _buildQuery(root: ASTNode, expressionValues: any){

        let condition = '';

        const traverse = (node : ASTNode) => {


            switch(node.type){
                case ASTNodeType.COMPARISON:{
                    condition += `${node.left.data} === ${node.right.data}`
                    break;
                }
                case ASTNodeType.BINARY_EXPRESSION:{
                    traverse(node.left)
                    condition += node.data === "and" ? " && " : " || "
                    traverse(node.right)
                    break;
                }
                case ASTNodeType.FUNCTION_CALL:{

                    switch(node.data.function){
                        case 'begins_with':{
                            condition += `${node.data.params[0].value}.startsWith(${node.data.params[1].value})`
                            break;
                        }
                    }

                }


            }

        }


        traverse(root.expression)

       for(const [key, value] of Object.entries(expressionValues) as [string, any]){

        condition = condition.replace(key, `"${value}"`)

       }

       return new Function(process.env.SORT_KEY, `return (${condition})`)
    }

    public get_item(getItem: GetItemInput){
        
        if(!(process.env.PRIMARY_KEY in getItem.Key) || !(process.env.SORT_KEY in getItem.Key)){
            throw new Error("missing keys")
        }

        const subLevel = this._db.sublevel(getItem.Key[process.env.PRIMARY_KEY])

        return subLevel.get(getItem.Key[process.env.SORT_KEY], { valueEncoding: 'json' })
    }

    public delete_item(deleteItem: DeleteItemInput){

        if(!(process.env.PRIMARY_KEY in deleteItem || process.env.SORT_KEY in deleteItem)){
            throw new Error("missing keys")
        }

        const pk = deleteItem.Key[process.env.PRIMARY_KEY];
        const sk = deleteItem.Key[process.env.SORT_KEY];

        const subLevel = this._db.sublevel(pk)

        subLevel.del(sk)
    }

    public put(putInput: PutItemInput){

        if(!(process.env.PRIMARY_KEY in putInput.Value || process.env.SORT_KEY in putInput.Value)){
            throw new Error("missing keys")
        }


        const pk = putInput.Value[process.env.PRIMARY_KEY];
        const sk = putInput.Value[process.env.SORT_KEY]

        const subLevel = this._db.sublevel(pk, {valueEncoding: 'json'})

        subLevel.put(sk, putInput.Value)
    }

}