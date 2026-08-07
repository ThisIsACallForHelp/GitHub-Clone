import { Statement } from "./Statement";
import {Expression} from "./Expression";
import { Tokens} from "../../Lexer/LexerTokens";
import { CommandListNode } from "./CommandListNode";
export class WhileNode extends Statement{
    public WhileToken : Tokens;
    public Condition : Expression | null;
    public LoopBody : CommandListNode | null;
    public constructor(Line : number , Token : number, Problem : string, WhileToken: Tokens, Condition: Expression | null, LoopBody: CommandListNode | null){
        super(Line, Token, Problem);
        this.WhileToken = WhileToken;
        this.Condition = Condition;
        this.LoopBody = LoopBody;
    }
}