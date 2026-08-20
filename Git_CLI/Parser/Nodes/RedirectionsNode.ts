import { Statement } from "./Statement";
import { Tokens} from "../../Lexer/LexerTokens.ts"
import {Expression} from "./Expression.ts"
export class RedirectionsNode extends Statement{
    public source : Expression;
    public operator : Tokens;
    public target : Expression;
    
    public constructor(Line : number , Token : Tokens, 
                       Problem : string, Source: Expression, 
                       Operator: Tokens, Target: Expression)
    {
        super(Line, Token, Problem);
        this.source = Source;
        this.operator = Operator;
        this.target = Target;
    }
}