import { TokenModel } from "../../Lexer/TokenModel.ts";
import { Tokens } from "../../Lexer/LexerTokens.ts";
import {Expression} from "./Expression.ts";
export class LogicalExpressionNode extends Expression{
    public left : Expression;
    public right : Expression;
    public operator : Tokens;
    public constructor(astToken : TokenModel, left: Expression, 
                       right: Expression, operator: Tokens)
    {
        super(astToken);
        this.left = left;
        this.right = right;
        this.operator = operator;
    }
}