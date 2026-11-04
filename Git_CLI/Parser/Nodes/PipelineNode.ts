import { Tokens } from "../../Lexer/LexerTokens.ts";
import { CommandListNode } from "./CommandListNode.ts";
import { Statement } from "./Statement.ts";

export class PipelineNode extends Statement{
    public commands : CommandListNode;

    public constructor(Line : number , Token : Tokens, 
                       Problem : string, Commands: CommandListNode)
    {
        super(Line, Token, Problem);
        this.commands = Commands;
    }
}