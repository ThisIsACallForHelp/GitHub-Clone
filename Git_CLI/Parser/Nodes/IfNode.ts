import { Statement } from "./Statement.ts";
import { Expression } from "./Expression.ts";
import {CommandListNode} from "./CommandListNode.ts";
import type { TokenModel } from "../../Lexer/TokenModel.ts";
export class IfNode extends Statement{
    public condition : Expression;
    public thenBody : CommandListNode;
    public elseChain : IfNode | CommandListNode |null;

    public constructor(astToken : TokenModel, 
                       Condition: Expression, ThenBody: CommandListNode, 
                       ElseChain: IfNode | CommandListNode|null)
    {
        super(astToken);
        this.condition = Condition;
        this.thenBody = ThenBody;
        this.elseChain = ElseChain;
    }
}