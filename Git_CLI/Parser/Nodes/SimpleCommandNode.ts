import { Statement } from "./Statement.ts";
import { RedirectionsNode } from "./RedirectionsNode.ts";
import { ArgumentNode } from "./ArgumentNode.ts";
import { Expression } from "./Expression.ts";
import { AssignmentNode } from "./AssignmentNode.ts";
import type { TokenModel } from "../../Lexer/TokenModel.ts";
export class SimpleCommandNode extends Statement{
    public commandName : Expression | null;
    public args : ArgumentNode[]
    public redirectors : RedirectionsNode[];
    public assignments : AssignmentNode[];

    public constructor(astToken : TokenModel, command: Expression | null, 
                       args: ArgumentNode[], redirectors: RedirectionsNode[], 
                       assignments : AssignmentNode[])
    {
        super(astToken);
        this.commandName = command;
        this.args = args;
        this.redirectors = redirectors;
        this.assignments = assignments;
    }
}