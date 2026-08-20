import { Tokens } from "../../Lexer/LexerTokens";
import { CommandListNode } from "./CommandListNode";
import { Statement } from "./Statement";

export class SubshellNode extends Statement{
    public shellCommands : CommandListNode;

    public constructor(Line : number , Token : Tokens, 
                       Problem : string, Commands: CommandListNode)
    {
        super(Line, Token, Problem);
        this.shellCommands = Commands;
    }
}