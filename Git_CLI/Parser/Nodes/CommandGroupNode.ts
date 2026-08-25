import { Tokens } from "../../Lexer/LexerTokens";
import { CommandListNode } from "./CommandListNode";
import { Statement } from "./Statement";

export class CommandGroupNode extends Statement{
    public commands : CommandListNode;
    public constructor(Line : number , Token : Tokens,
                       Problem : string, Commands: CommandListNode)
    {
        super(Line, Token, Problem);
        this.commands = Commands;
    }
}