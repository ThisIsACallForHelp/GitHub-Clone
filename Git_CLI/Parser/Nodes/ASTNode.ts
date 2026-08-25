import { Tokens } from "../../Lexer/LexerTokens";

export class ASTNode{
    public lineNumber : number = 0;
    public Token : Tokens;
    public ErrorVal : string = "";
    constructor(Line : number, Token : Tokens, 
                tVal : string)
    {
        this.lineNumber = Line;
        this.Token = Token;
        this.ErrorVal = tVal;
    }
}