import type { TokenModel } from "../../Lexer/TokenModel.ts";
import { CommandListNode } from "./CommandListNode.ts";
import { Expression } from "./Expression.ts";
import { Statement } from "./Statement.ts";

export class UntilNode extends Statement{
    public condition : Expression | null;
    public loopBody : CommandListNode | null;

    public constructor(astToken : TokenModel, condition: Expression | null, 
                       loopBody: CommandListNode | null)
    {
        super(astToken);
        this.condition = condition;
        this.loopBody = loopBody;
    }
}