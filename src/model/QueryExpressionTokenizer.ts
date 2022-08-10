export class QueryExpressionTokenizer{

    private _tokens: Token[]
    private expression: string;
    private currIndex: number;

    constructor(expression: string){
        this._tokens = [];
        this.expression = expression
        this.currIndex = 0;
        this.tokenize()
    }

    private handleIdentifier(): string {
        let currValue = '';
 

        for(;this.currIndex < this.expression.length && !['\n', '\t', ' ', '(', ')', ','].includes(this.expression[this.currIndex]); this.currIndex++){
            currValue += this.expression[this.currIndex]
        }


        this.currIndex -= 1;

        return currValue
    }

    private lookAhead(currIndex: number, match: string){

        if(currIndex + 1 > this.expression.length){
            return false;
        }

        if(this.expression[currIndex + 1] === match){
            return true
        }

        return false;
    }
  
    private tokenize(){

        for(this.currIndex = 0; this.currIndex < this.expression.length; this.currIndex++){
            const char = this.expression[this.currIndex]

            switch(char){
                case ':':{

                    let currValue = this.handleIdentifier()

                    this._tokens.push({type: TokenType.EXPRESSION_VALUE, value: currValue})
                    break;
                }
                case '(':{
                   this._tokens.push({type: TokenType.LEFT_PARENTHESIS, value: char}) 
                   break;
                }
                case ')':{
                    this._tokens.push({type: TokenType.RIGHT_PARENTHESIS, value: char}) 
                    break;
                }
                case '=':{
                    this._tokens.push({type: TokenType.EQUAL, value: char}) 
                    break;
                }
                case ',':{
                    this._tokens.push({type: TokenType.COMMA, value: char}) 
                    break;  
                }
                case 'a':
                case 'A':
                case 'O':
                case 'o':{

                    if((this.lookAhead(this.currIndex, 'n') && this.lookAhead(this.currIndex + 1, 'd')) || this.lookAhead(this.currIndex, 'N') && this.lookAhead(this.currIndex + 1, 'D')){

                        this._tokens.push({type: TokenType.BINARY_OPERATOR, value: 'and'})

                        this.currIndex += 2

                    }else if (this.lookAhead(this.currIndex, 'r') || this.lookAhead(this.currIndex, 'R')){

                        this._tokens.push({type: TokenType.BINARY_OPERATOR, value: 'or'})

                        this.currIndex += 1
                    }

                    break;
                }
                default: {

                    if(char >= '0' && char <= '9'){
                        throw new Error("numbers not allowed")
                    }else{
                        const identifier = this.handleIdentifier();

                        this._tokens.push({type: TokenType.IDENTIFIER, value: identifier})
                    }
                    
                    
                }
                case ' ':
                case '\n':
                case '\t':
                    continue;
                }
   
        }
        this._tokens.push({type: TokenType.EOL, value: ''})
    }


    public get tokens(){
        return this._tokens;
    }



}

export interface Token{
    type: TokenType,
    value: string
}

export enum TokenType{
    IDENTIFIER,
    EXPRESSION_VALUE,
    EQUAL,
    COMMA,
    BINARY_OPERATOR,
    LEFT_PARENTHESIS,
    RIGHT_PARENTHESIS,
    EOL
}