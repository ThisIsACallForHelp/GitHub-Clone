import { Statement } from "./Statement";
import { Expression } from "./Expression";
import { Tokens } from "../../Lexer/LexerTokens";
import {CommandListNode} from "./CommandListNode";
export class IfNode extends Statement{
    public IfToken: Tokens;
    public Condition : Expression;
    public ThenBody : CommandListNode;
    public ElseChain : IfNode | null;

    public constructor(Line : number, Token : number, Problem : string, IfToken: Tokens, Condition: Expression, ThenBody: CommandListNode, ElseChain: IfNode | null){
        super(Line, Token, Problem);
        this.IfToken = IfToken;
        this.Condition = Condition;
        this.ThenBody = ThenBody;
        this.ElseChain = ElseChain;
    }
}