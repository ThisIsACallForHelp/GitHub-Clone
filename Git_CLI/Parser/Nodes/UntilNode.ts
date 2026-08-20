import { Tokens } from "../../Lexer/LexerTokens";
import { CommandListNode } from "./CommandListNode";
import { Expression } from "./Expression";
import { Statement } from "./Statement";

export class UntilNode extends Statement{
    public condition : Expression | null;
    public loopBody : CommandListNode | null;

    public constructor(Line : number , Token : Tokens,
                       Problem : string, condition: Expression | null, 
                       loopBody: CommandListNode | null)
    {
        super(Line, Token, Problem);
        this.condition = condition;
        this.loopBody = loopBody;
    }
}