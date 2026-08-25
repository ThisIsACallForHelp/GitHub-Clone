import { Statement } from "./Statement";
import { Expression } from "./Expression";
import { Tokens } from "../../Lexer/LexerTokens";
import {CommandListNode} from "./CommandListNode";
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