import {Expression} from "./Expression";
import {Tokens} from "../../Lexer/LexerTokens.ts"
export class LogicalExpressionNode extends Expression{
    public left : Expression;
    public right : Expression;
    public operator : Tokens;
    public constructor(Line : number , Token : number, Problem : string, left: Expression, right: Expression, operator: Tokens){
        super(Line, Token, Problem);
        this.left = left;
        this.right = right;
        this.operator = operator;
    }
}