import { Tokens } from "../../Lexer/LexerTokens.ts";
import { CommandListNode } from "./CommandListNode.ts";
import { Expression } from "./Expression.ts";
import { Statement } from "./Statement.ts";

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