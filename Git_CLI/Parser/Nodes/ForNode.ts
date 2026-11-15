import { Statement } from "./Statement.ts";
import { Expression } from "./Expression.ts";
import { CommandListNode } from "./CommandListNode.ts";
import type { TokenModel } from "../../Lexer/TokenModel.ts";
export class ForNode extends Statement{
    public initVars : Statement | null;
    public condition : Expression | null;
    public manipVars : Expression | null;
    public loopBody : CommandListNode;
    public constructor(astToken : TokenModel, 
                       InitVars: Statement | null, 
                       Condition: Expression | null, 
                       ManipVars: Expression | null, 
                       LoopBody: CommandListNode)
    {
        super(astToken);
        this.initVars = InitVars;
        this.condition = Condition;
        this.manipVars = ManipVars;
        this.loopBody = LoopBody;
    }
}