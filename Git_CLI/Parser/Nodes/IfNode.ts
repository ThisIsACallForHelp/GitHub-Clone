import { Statement } from "./Statement.ts";
import { Expression } from "./Expression.ts";
import { Tokens } from "../../Lexer/LexerTokens.ts";
import {CommandListNode} from "./CommandListNode.ts";
export class IfNode extends Statement{
    public ifToken: Tokens;
    public condition : Expression;
    public thenBody : CommandListNode;
    public elseChain : IfNode | CommandListNode |null;

    public constructor(Line : number, Token : Tokens, 
                       Problem : string, IfToken: Tokens, 
                       Condition: Expression, ThenBody: CommandListNode, 
                       ElseChain: IfNode | CommandListNode|null)
    {
        super(Line, Token, Problem);
        this.ifToken = IfToken;
        this.condition = Condition;
        this.thenBody = ThenBody;
        this.elseChain = ElseChain;
    }
}