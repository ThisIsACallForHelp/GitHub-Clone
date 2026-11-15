import { Statement } from "./Statement.ts";
import { Tokens} from "../../Lexer/LexerTokens.ts"
import {Expression} from "./Expression.ts"
import type { TokenModel } from "../../Lexer/TokenModel.ts";
export class RedirectionsNode extends Statement{
    public source : Expression;
    public operator : Tokens;
    public target : Expression;
    
    public constructor(astToken : TokenModel, Source: Expression, 
                       Operator: Tokens, Target: Expression)
    {
        super(astToken);
        this.source = Source;
        this.operator = Operator;
        this.target = Target;
    }
}