import type { TokenModel } from "../../Lexer/TokenModel.ts";
import { CommandListNode } from "./CommandListNode.ts";
import { Statement } from "./Statement.ts";

export class SubshellNode extends Statement{
    public shellCommands : CommandListNode;

    public constructor(astToken : TokenModel, Commands: CommandListNode)
    {
        super(astToken);
        this.shellCommands = Commands;
    }
}