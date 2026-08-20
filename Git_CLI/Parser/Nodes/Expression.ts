import { Tokens } from "../../Lexer/LexerTokens";
import { ASTNode } from "./ASTNode";
export class Expression extends ASTNode{
    public constructor(Line : number, Token : Tokens, 
                       Problem : string)
    {
        super(Line, Token, Problem);
    }
}