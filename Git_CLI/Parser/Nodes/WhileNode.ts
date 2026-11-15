import { Statement } from "./Statement.ts";
import {Expression} from "./Expression.ts";
import { CommandListNode } from "./CommandListNode.ts";
import type { TokenModel } from "../../Lexer/TokenModel.ts";
export class WhileNode extends Statement{
    public condition : Expression | null;
    public loopBody : CommandListNode | null;
    public constructor(astToken : TokenModel, 
                       Condition: Expression | null, LoopBody: CommandListNode | null)
    {
        super(astToken);
        this.condition = Condition;
        this.loopBody = LoopBody;
    }
}