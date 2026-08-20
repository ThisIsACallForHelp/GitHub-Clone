import { Statement } from "./Statement";
import { RedirectionsNode } from "./RedirectionsNode";
import { Tokens } from "../../Lexer/LexerTokens";
import { ArgumentNode } from "./ArgumentNode";
export class SimpleCommandNode extends Statement{
    public command : string;
    public args : ArgumentNode[]
    public redirectors : RedirectionsNode[];

    public constructor(Line : number , Token : Tokens, 
                       Problem : string, command: string, 
                       args: ArgumentNode[], redirectors: RedirectionsNode[])
    {
        super(Line, Token, Problem);
        this.command = command;
        this.args = args;
        this.redirectors = redirectors;
    }
}