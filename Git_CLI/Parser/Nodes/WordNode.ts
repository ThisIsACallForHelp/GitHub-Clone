import { Expression } from "./Expression.ts";
import {Tokens } from "../../Lexer/LexerTokens.ts"
export class WordNode extends Expression{
    public raw : string;
    public constructor(Content : string, line : number, 
                       token : Tokens, problemStr : string)
    {
        super(line, token, problemStr);
        this.raw = Content;
    }
}