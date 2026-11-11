import type { TokenModel } from "../../Lexer/TokenModel.ts";
import { CaseArmNode } from "./CaseArmNode.ts";
import { Expression } from "./Expression.ts";
import { Statement } from "./Statement.ts";

export class CaseNode extends Statement{
    public testedExpression : Expression;
    public node : CaseArmNode[] | null;
    public constructor(astToken : TokenModel, testedExpression: Expression, 
                       node: CaseArmNode[] | null)
    {
        super(astToken);
        this.testedExpression = testedExpression;
        this.node = node;
    }
}