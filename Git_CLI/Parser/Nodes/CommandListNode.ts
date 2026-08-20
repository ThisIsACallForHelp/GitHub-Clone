import { Tokens } from "../../Lexer/LexerTokens";
import { Statement } from "./Statement";

export class CommandListNode extends Statement{
    public commands : Statement[];
    public constructor(Line : number , Token : Tokens,
                       Problem : string, Commands: Statement[])
    {
        super(Line, Token, Problem);
        this.commands = Commands;
    }
}