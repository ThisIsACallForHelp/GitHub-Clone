import { Expression } from "./Expression";
import {Tokens } from "../../Lexer/LexerTokens"
export class WordNode extends Expression{
    public raw : string;
    public constructor(Content : string, line : number, 
                       token : Tokens, problemStr : string)
    {
        super(line, token, problemStr);
        this.raw = Content;
    }
}