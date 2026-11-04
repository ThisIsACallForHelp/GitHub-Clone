import { Tokens } from "../../Lexer/LexerTokens.ts";
import { Expression } from "./Expression.ts";

export class ArgumentNode extends Expression{
    
    public parts : Expression[];
    public constructor(Line : number , Token : Tokens, 
                       Problem : string,parts: Expression[])
    {
        super(Line, Token, Problem);
        this.parts = parts;
    }
}