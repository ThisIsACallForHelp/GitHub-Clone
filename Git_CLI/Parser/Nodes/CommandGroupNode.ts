import type { TokenModel } from "../../Lexer/TokenModel.ts";
import { CommandListNode } from "./CommandListNode.ts";
import { Statement } from "./Statement.ts";

export class CommandGroupNode extends Statement{
    public commands : CommandListNode;
    public constructor(astToken : TokenModel, Commands: CommandListNode)
    {
        super(astToken);
        this.commands = Commands;
    }
}