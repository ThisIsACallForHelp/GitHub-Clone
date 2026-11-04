import { Tokens } from "../../Lexer/LexerTokens.ts";
import { Expression } from "./Expression.ts";

export class VariableBracedNode extends Expression{
    public name : string;
    public fallback : Tokens | null;
    public defaultValue : Expression | null;
    public constructor(Line : number , Token : Tokens, 
                       Problem : string, name: string, 
                       fallback: Tokens | null, defaultValue: Expression | null)
    {
        super(Line, Token, Problem);
        this.name = name;
        this.fallback = fallback;
        this.defaultValue = defaultValue;
    }
}