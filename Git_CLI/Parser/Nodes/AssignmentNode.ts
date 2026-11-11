import {Tokens} from "../../Lexer/LexerTokens.ts";
import {Expression} from "./Expression.ts";
import { ASTNode } from "./ASTNode.ts";
import type { TokenModel } from "../../Lexer/TokenModel.ts";
export class AssignmentNode extends ASTNode{
    public variableName : string;
    public AssignmentType : Tokens;
    public expression : Expression;
    public constructor(astToken : TokenModel, VariableName: string,
                       AssignType: Tokens, Expression: Expression)
    {
        super(astToken);
        this.variableName = VariableName;
        this.AssignmentType = AssignType;
        this.expression = Expression;
    }

}