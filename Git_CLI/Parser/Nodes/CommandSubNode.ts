import { Expression } from "./Expression";
import { ProgramNode } from "./ProgramNode";
import { CommandListNode } from "./CommandListNode";
export class CommandSubNode extends Expression{
    inner : ProgramNode | CommandListNode;
}