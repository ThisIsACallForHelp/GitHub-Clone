import { CaseArmNode } from "./CaseArmNode";
import { Expression } from "./Expression";
import { Statement } from "./Statement";

export class CaseNode extends Statement{
    testedExpression : Expression;
    node : CaseArmNode[] | null;
    public constructor(Line : number , Token : number, Problem : string, testedExpression: Expression, node: CaseArmNode[] | null){
        super(Line, Token, Problem);
        this.testedExpression = testedExpression;
        this.node = node;
    }
}