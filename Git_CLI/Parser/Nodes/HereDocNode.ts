import { Tokens } from "../../Lexer/LexerTokens";
import { Statement } from "./Statement";

export class HereDocNode extends Statement{
    public hereDocContent : string;
    public delimeter : string;
    public command : Statement;
    public constructor(Line : number , Token : Tokens, 
                       Problem : string, HereDocContent: string, 
                       Delimeter: string, Command: Statement)
    {
        super(Line, Token, Problem);
        this.hereDocContent = HereDocContent;
        this.delimeter = Delimeter;
        this.command = Command;
    }
}