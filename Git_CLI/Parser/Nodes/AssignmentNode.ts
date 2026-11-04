import {Tokens} from "../../Lexer/LexerTokens.ts";
import {Expression} from "./Expression.ts";
import { ASTNode } from "./ASTNode.ts";
export class AssignmentNode extends ASTNode{
    public variableName : string;
    public equalsToken : Tokens;
    public expression : Expression;
    public constructor(Line : number , Token : Tokens, 
                       Problem : string, VariableName: string,
                       EqualsToken: Tokens, Expression: Expression)
    {
        super(Line, Token, Problem);
        this.variableName = VariableName;
        this.equalsToken = EqualsToken;
        this.expression = Expression;
    }

}