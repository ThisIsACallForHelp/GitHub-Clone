import { Statement } from "./Statement";
import {Expression} from "./Expression";
import { Tokens} from "../../Lexer/LexerTokens";
import { CommandListNode } from "./CommandListNode";
export class WhileNode extends Statement{
    public whileToken : Tokens;
    public condition : Expression | null;
    public loopBody : CommandListNode | null;
    public constructor(Line : number , Token : Tokens, 
                       Problem : string, WhileToken: Tokens, 
                       Condition: Expression | null, LoopBody: CommandListNode | null)
    {
        super(Line, Token, Problem);
        this.whileToken = WhileToken;
        this.condition = Condition;
        this.loopBody = LoopBody;
    }
}