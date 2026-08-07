import {Tokens} from "../../Lexer/LexerTokens";
import {Expression} from "./Expression";
export class AssignmentNode extends ASTNode{
    public VariableName : string;
    public EqualsToken : Tokens;
    public Expression : Expression;
    public constructor(Line : number , Token : number, Problem : string, VariableName: string, EqualsToken: Tokens, Expression: Expression){
        super(Line, Token, Problem);
        this.VariableName = VariableName;
        this.EqualsToken = EqualsToken;
        this.Expression = Expression;
    }

}