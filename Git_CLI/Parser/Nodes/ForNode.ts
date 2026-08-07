import { Statement } from "./Statement.ts";
import { Tokens } from "../../Lexer/LexerTokens.ts";
import { Expression } from "./Expression.ts";
export class ForNode extends Statement{
    public ForToken : Tokens;
    public InitVars : Statement | null;
    public Condition : Expression | null;
    public ManipVars : Expression | null;
    public LoopBody : Statement | null;
    public constructor(Line : number , Token : number, Problem : string, ForToken: Tokens, InitVars: Statement | null, Condition: Expression | null, ManipVars: Expression | null, LoopBody: Statement | null){
        super(Line, Token, Problem);
        this.ForToken = ForToken;
        this.InitVars = InitVars;
        this.Condition = Condition;
        this.ManipVars = ManipVars;
        this.LoopBody = LoopBody;
    }
}