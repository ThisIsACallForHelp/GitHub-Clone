import { Statement } from "./Statement.ts";
import { RedirectionsNode } from "./RedirectionsNode.ts";
import { Tokens } from "../../Lexer/LexerTokens.ts";
import { ArgumentNode } from "./ArgumentNode.ts";
import { Expression } from "./Expression.ts";
import { AssignmentNode } from "./AssignmentNode.ts";
export class SimpleCommandNode extends Statement{
    public commandName : Expression | null;
    public args : ArgumentNode[]
    public redirectors : RedirectionsNode[];
    public assignments : AssignmentNode[];

    public constructor(Line : number , Token : Tokens, 
                       Problem : string, command: Expression | null, 
                       args: ArgumentNode[], redirectors: RedirectionsNode[], 
                       assignments : AssignmentNode[])
    {
        super(Line, Token, Problem);
        this.commandName = command;
        this.args = args;
        this.redirectors = redirectors;
        this.assignments = assignments;
    }
}