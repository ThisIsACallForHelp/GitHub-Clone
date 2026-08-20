import { Statement } from "./Statement.ts";
import { Tokens } from "../../Lexer/LexerTokens.ts";
import { Expression } from "./Expression.ts";
import { CommandListNode } from "./CommandListNode.ts";
export class ForNode extends Statement{
    public forToken : Tokens;
    public initVars : Statement | null;
    public condition : Expression | null;
    public manipVars : Expression | null;
    public loopBody : CommandListNode;
    public constructor(Line : number , Token : Tokens, 
                       Problem : string, ForToken: Tokens, 
                       InitVars: Statement | null, 
                       Condition: Expression | null, 
                       ManipVars: Expression | null, 
                       LoopBody: CommandListNode)
    {
        super(Line, Token, Problem);
        this.forToken = ForToken;
        this.initVars = InitVars;
        this.condition = Condition;
        this.manipVars = ManipVars;
        this.loopBody = LoopBody;
    }
}