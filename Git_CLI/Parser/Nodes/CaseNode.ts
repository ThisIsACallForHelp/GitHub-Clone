import { Tokens } from "../../Lexer/LexerTokens.ts";
import { CaseArmNode } from "./CaseArmNode.ts";
import { Expression } from "./Expression.ts";
import { Statement } from "./Statement.ts";

export class CaseNode extends Statement{
    public testedExpression : Expression;
    public node : CaseArmNode[] | null;
    public constructor(Line : number , Token : Tokens, 
                       Problem : string, testedExpression: Expression, 
                       node: CaseArmNode[] | null)
    {
        super(Line, Token, Problem);
        this.testedExpression = testedExpression;
        this.node = node;
    }
}