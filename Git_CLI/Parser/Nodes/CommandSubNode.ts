import { Expression } from "./Expression";
import { ProgramNode } from "./ProgramNode";
import { CommandListNode } from "./CommandListNode";
import { Tokens } from "../../Lexer/LexerTokens";
export class CommandSubNode extends Expression{
    inner : ProgramNode | CommandListNode;
    public constructor(Line : number , Token : Tokens, 
                       Problem : string, inner: ProgramNode | CommandListNode)
    {
        super(Line, Token, Problem);
        this.inner = inner;
    }
}