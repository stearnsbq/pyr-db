import { Token, TokenType } from "./QueryExpressionTokenizer";

export const builtIns = ["begins_with", "contains"];

export class QueryExpressionParser {
  public tokens: Token[];
  private currentParserIndex: number;
  public tree: ASTNode;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.currentParserIndex = 0;
    this.queryExpression();
  }

  private comparison() : ASTNode{

    const node: ASTNode = {type: ASTNodeType.COMPARISON}

    node.left = {type: ASTNodeType.IDENTIFIER, data: this.tokens[this.currentParserIndex].value}

    this.currentParserIndex++

    if(this.tokens[this.currentParserIndex].type !== TokenType.EQUAL){
        throw new Error("equal expected");
    }

    this.currentParserIndex++

    if(this.tokens[this.currentParserIndex].type !== TokenType.EXPRESSION_VALUE){
        throw new Error("expression value expected");
    }

    node.right = {type: ASTNodeType.EXPRESSION_VALUE, data: this.tokens[this.currentParserIndex].value}

    this.currentParserIndex++


    return node;
  }

  private binaryOpBranch(): ASTNode{


    if (this.tokens[this.currentParserIndex + 1].type === TokenType.EQUAL) {

        return this.comparison()
  
      } else if (this.tokens[this.currentParserIndex + 1].type === TokenType.LEFT_PARENTHESIS) {
  
        if (!builtIns.includes(this.tokens[this.currentParserIndex].value)) {
          throw new Error("function does not exist");
        }
  
        return this.functionCall()
  
      } else {
        throw new Error("parenthesis or equal expected");
      }



  }

  private binaryOperation() : ASTNode {
    let left;
    let right;
    let operator;


    if (this.tokens[this.currentParserIndex].type !== TokenType.IDENTIFIER) {
      throw new Error("expected identifier");
    }

    left = this.binaryOpBranch()

    if(this.tokens[this.currentParserIndex].type === TokenType.EOL){
        return left
    }

    if (this.tokens[this.currentParserIndex].type !== TokenType.BINARY_OPERATOR) {
        throw new Error("binary operator expected")
    }

    operator = this.tokens[this.currentParserIndex].value;
    this.currentParserIndex++;

    right = this.binaryOpBranch();

    const node = { type: ASTNodeType.BINARY_EXPRESSION, data: operator, left, right };



    if(this.tokens[this.currentParserIndex].type === TokenType.BINARY_OPERATOR){
        operator = this.tokens[this.currentParserIndex].value;

        this.currentParserIndex++;

        return { type: ASTNodeType.BINARY_EXPRESSION, data: operator, left: node, right: this.binaryOperation() }
    }

    return node;
  }



  private functionCall() : ASTNode {

    let node: ASTNode = {type: ASTNodeType.FUNCTION_CALL, data: {function: this.tokens[this.currentParserIndex].value, params: []}}

    this.currentParserIndex++


    if (this.tokens[this.currentParserIndex].type !== TokenType.LEFT_PARENTHESIS) {
      throw new Error("expected parenthesis");
    }

    this.currentParserIndex++;

    if (this.tokens[this.currentParserIndex].type !== TokenType.IDENTIFIER) {
      throw new Error("expected identifier");
    }

    node.data.params.push(this.tokens[this.currentParserIndex])

    this.currentParserIndex++;

    if (
        this.tokens[this.currentParserIndex].type !== TokenType.COMMA
      ) {
        throw new Error(`expected comma got: ${this.tokens[this.currentParserIndex].value}`);
      }
    
      this.currentParserIndex++;

    if (
      this.tokens[this.currentParserIndex].type !== TokenType.EXPRESSION_VALUE
    ) {
      throw new Error(`expected expression value got: ${this.tokens[this.currentParserIndex].value}`);
    }

    node.data.params.push(this.tokens[this.currentParserIndex])

    this.currentParserIndex++;

    if (
      this.tokens[this.currentParserIndex].type !== TokenType.RIGHT_PARENTHESIS
    ) {
      throw new Error("expected parenthesis");
    }

    this.currentParserIndex++;

    return node;
  }

  private queryExpression() {
    this.tree = { type: ASTNodeType.QUERY_EXPRESSION, expression: this.binaryOperation() };
  }
}

export interface ASTNode {
  type: ASTNodeType;
  data?: any;
  expression?: ASTNode;
  left?: ASTNode;
  right?: ASTNode;
}

export enum ASTNodeType {
  IDENTIFIER,
  EXPRESSION_VALUE,
  COMPARISON,
  QUERY_EXPRESSION,
  FUNCTION_CALL,
  BINARY_EXPRESSION,
}

