import { Tokens } from "../../Lexer/LexerTokens";
import { Expression } from "./Expression";

export class VariableNode extends Expression{
    public name : string;
    public type : Tokens;
    public initializer : Expression | null;
    public constructor(Line : number , Token : Tokens, 
                       Problem : string, Name: string, 
                       Type: Tokens, Initializer: Expression | null)
    {
        super(Line, Token, Problem);
        this.name = Name;
        this.type = Type;
        this.initializer = Initializer;
    }
}