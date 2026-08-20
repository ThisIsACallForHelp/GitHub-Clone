import { Tokens } from "../../Lexer/LexerTokens";
import { CaseArmNode } from "./CaseArmNode";
import { Expression } from "./Expression";
import { Statement } from "./Statement";

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