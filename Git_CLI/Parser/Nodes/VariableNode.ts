import { Tokens } from "../../Lexer/LexerTokens.ts";
import type { TokenModel } from "../../Lexer/TokenModel.ts";
import { Expression } from "./Expression.ts";

export class VariableNode extends Expression{
    public name : string;
    public type : Tokens;
    public initializer : Expression | null;
    public constructor(astToken : TokenModel, Name: string, 
                       Type: Tokens, Initializer: Expression | null)
    {
        super(astToken);
        this.name = Name;
        this.type = Type;
        this.initializer = Initializer;
    }
}