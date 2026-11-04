import { Tokens } from "../../Lexer/LexerTokens.ts";
import { ASTNode } from "./ASTNode.ts";
export class Expression extends ASTNode{
    public constructor(Line : number, Token : Tokens, 
                       Problem : string)
    {
        super(Line, Token, Problem);
    }
}