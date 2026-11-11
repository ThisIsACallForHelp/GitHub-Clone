import type { TokenModel } from "../../Lexer/TokenModel.ts";
import { Statement } from "./Statement.ts";

export class HereDocNode extends Statement{
    public hereDocContent : string;
    public delimeter : string;
    public command : Statement;
    public constructor(astToken : TokenModel, HereDocContent: string, 
                       Delimeter: string, Command: Statement)
    {
        super(astToken);
        this.hereDocContent = HereDocContent;
        this.delimeter = Delimeter;
        this.command = Command;
    }
}