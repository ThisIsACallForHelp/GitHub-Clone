import { Expression } from "./Expression.ts";
import { ProgramNode } from "./ProgramNode.ts";
import { CommandListNode } from "./CommandListNode.ts";
import { Tokens } from "../../Lexer/LexerTokens.ts";
export class CommandSubNode extends Expression{
    inner : ProgramNode | CommandListNode;
    public constructor(Line : number , Token : Tokens, 
                       Problem : string, inner: ProgramNode | CommandListNode)
    {
        super(Line, Token, Problem);
        this.inner = inner;
    }
}