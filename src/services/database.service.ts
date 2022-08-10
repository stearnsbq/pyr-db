import {Injectable} from '@pyrjs/core'
import { ClassicLevel } from 'classic-level';
import { ASTNode, ASTNodeType, QueryExpressionParser } from '../model/QueryExpressionParser';
import { QueryExpressionSemanticAnalyzer } from '../model/QueryExpressionSemanticAnalyzer';
import { QueryExpressionTokenizer, TokenType } from '../model/QueryExpressionTokenizer';
import { QueryInput } from '../model/Query';
import { GetItemInput } from '../model/GetItem';
import { UpdateItemInput } from 'src/model/UpdateItem';
import { PutItemInput } from 'src/model/PutItem';

@Injectable()
export class DatabaseService{
    
    private _db: ClassicLevel 

    constructor(){
        this._db = new ClassicLevel("./db.pyr", {valueEncoding: 'json'})
    }


    public async query(query: QueryInput){

        const tokenizer = new QueryExpressionTokenizer(query.KeyConditionExpression)

        const parser = new QueryExpressionParser(tokenizer.tokens)

        const analyzer = new QueryExpressionSemanticAnalyzer(parser.tree)

        // build the query condition
        const [condition, partitionKey] = this._buildQuery(parser.tree, query.ExpressionValues)

        const partition = this._db.sublevel(partitionKey as string);

        const items = [];

        for await (const [key, value] of partition.iterator<string, any>({valueEncoding: 'json'}) ){

            if((condition as Function)(value)){
                items.push(value)
            }

        }

        
        return items;
   
    }

    private _buildQuery(root: ASTNode, expressionValues: any){

        let condition = '';

        let partitionKey = '';

        const traverse = (node : ASTNode) => {


            switch(node.type){
                case ASTNodeType.COMPARISON:{
                    condition += `${node.left.data} === ${node.right.data}`
                    partitionKey = node.right.data
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

       partitionKey = expressionValues[partitionKey]

       return [new Function(process.env.PRIMARY_KEY, process.env.SORT_KEY, `return (${condition})`), partitionKey]
    }

    public get_item(getItem: GetItemInput){
        
        if(!(process.env.PRIMARY_KEY in getItem.Key) || !(process.env.SORT_KEY in getItem.Key)){
            throw new Error("missing keys")
        }

        const subLevel = this._db.sublevel(getItem.Key[process.env.PRIMARY_KEY])

        return subLevel.get(getItem.Key[process.env.SORT_KEY], { valueEncoding: 'json' })
    }

    public delete_item(){

    }

    public put(putInput: PutItemInput){

        if(!(process.env.PRIMARY_KEY in putInput || process.env.SORT_KEY in putInput)){
            throw new Error("missing keys")
        }


        const key = putInput[process.env.PRIMARY_KEY];
        const subLevel = this._db.sublevel(key)

        subLevel.put(key, putInput)
    }

}