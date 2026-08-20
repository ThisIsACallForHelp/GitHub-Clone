import { Expression } from "./Expression";
import { Tokens } from "../../Lexer/LexerTokens";
export class StringNode extends Expression{
    public content : string;
    public constructor(Content : string, line : number, 
                       token : Tokens, problemStr : string)
    {
        super(line, token, problemStr);
        this.content = Content;
    }
}