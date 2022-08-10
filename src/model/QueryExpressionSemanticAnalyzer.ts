import { ASTNode, ASTNodeType } from "./QueryExpressionParser";

export class QueryExpressionSemanticAnalyzer{

    private _ast: ASTNode;

    constructor(ast: ASTNode){
        this._ast = ast;
        this.analyze()
    }   


    private findNode(node: ASTNode, cmpFunc: (node: ASTNode) => boolean): boolean{

        switch(node.type){

            case ASTNodeType.QUERY_EXPRESSION:{
                 return this.findNode(node.expression, cmpFunc)
            }
            case ASTNodeType.BINARY_EXPRESSION:
            case ASTNodeType.COMPARISON:{
                
                if(this.findNode(node.left, cmpFunc)){
                    return true
                }

                if(this.findNode(node.right, cmpFunc)){
                    return true;
                }   

                break;
            }


        }

        return cmpFunc(node)
    }


    public analyze(){

        // check if pk cmp node exists

        const doesPkCMPNodeExist = this.findNode(this._ast, (node) => {
            return node.type === ASTNodeType.IDENTIFIER && node.data === process.env.PRIMARY_KEY
        })


        if(!doesPkCMPNodeExist){
            throw new Error("missing partition key comparison node")
        }

        const invalidFunctionCalls = this.findNode(this._ast, (node) => {

            if(node.type !== ASTNodeType.FUNCTION_CALL){
                return false;
            }

            const params = node.data.params as any[];

            const paramsLength = params.length !== 2;
            const sortKeyNotFirstParam = params[0].value !== process.env.SORT_KEY

            return paramsLength || sortKeyNotFirstParam
        }) 

        if(invalidFunctionCalls){
            throw new Error("invalid function call")
        }

    }


}