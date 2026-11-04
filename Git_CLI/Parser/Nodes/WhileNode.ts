import { Statement } from "./Statement.ts";
import {Expression} from "./Expression.ts";
import { Tokens} from "../../Lexer/LexerTokens.ts";
import { CommandListNode } from "./CommandListNode.ts";
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