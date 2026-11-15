import { Tokens } from "../../Lexer/LexerTokens.ts";
import type { TokenModel } from "../../Lexer/TokenModel.ts";
import { Expression } from "./Expression.ts";

export class VariableBracedNode extends Expression{
    public name : string;
    public fallback : Tokens | null;
    public defaultValue : Expression | null;
    public constructor(astToken : TokenModel, name: string, 
                       fallback: Tokens | null, defaultValue: Expression | null)
    {
        super(astToken);
        this.name = name;
        this.fallback = fallback;
        this.defaultValue = defaultValue;
    }
}