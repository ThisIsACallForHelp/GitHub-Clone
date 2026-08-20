import { Tokens } from "../../Lexer/LexerTokens";
import { Expression } from "./Expression";

export class ArgumentNode extends Expression{
    public raw : string;
    public parts : Expression[];
    public expanded : string;
    public constructor(Line : number , Token : Tokens, 
                       Problem : string, raw: string, 
                       parts: Expression[], expanded: string)
    {
        super(Line, Token, Problem);
        this.raw = raw;
        this.parts = parts;
        this.expanded = expanded;
    }
}