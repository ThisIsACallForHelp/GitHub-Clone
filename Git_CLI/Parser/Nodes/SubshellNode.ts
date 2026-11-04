import { Tokens } from "../../Lexer/LexerTokens.ts";
import { CommandListNode } from "./CommandListNode.ts";
import { Statement } from "./Statement.ts";

export class SubshellNode extends Statement{
    public shellCommands : CommandListNode;

    public constructor(Line : number , Token : Tokens, 
                       Problem : string, Commands: CommandListNode)
    {
        super(Line, Token, Problem);
        this.shellCommands = Commands;
    }
}