import type { TokenModel } from "../../Lexer/TokenModel.ts";
import { Statement } from "./Statement.ts";

export class CommandListNode extends Statement{
    public commands : Statement[];
    public constructor(astToken : TokenModel, Commands: Statement[])
    {
        super(astToken);
        this.commands = Commands;
    }
}