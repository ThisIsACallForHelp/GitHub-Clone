import { Statement } from "./Statement";
import { Tokens} from "../../Lexer/LexerTokens.ts"
import {Expression} from "./Expression.ts"
export class RedirectionsNode extends Statement{
    public Source : Expression;
    public Operator : Tokens;
    public Target : Expression;
    
    public constructor(Line : number , Token : number, Problem : string, Source: Expression, Operator: Tokens, Target: Expression){
        super(Line, Token, Problem);
        this.Source = Source;
        this.Operator = Operator;
        this.Target = Target;
    }
}