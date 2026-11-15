import { Expression } from "./Expression.ts";
import { ProgramNode } from "./ProgramNode.ts";
import { CommandListNode } from "./CommandListNode.ts";
import type { TokenModel } from "../../Lexer/TokenModel.ts";
export class CommandSubNode extends Expression{
    inner : ProgramNode | CommandListNode;
    public constructor(astToken : TokenModel, inner: ProgramNode | CommandListNode)
    {
        super(astToken);
        this.inner = inner;
    }
}