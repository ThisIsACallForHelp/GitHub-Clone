import { Expression } from "./Expression";
import { ProgramNode } from "./ProgramNode";
import { CommandListNode } from "./CommandListNode";
export class CommandSubNode extends Expression{
    inner : ProgramNode | CommandListNode;
    public constructor(Line : number , Token : number, Problem : string, inner: ProgramNode | CommandListNode){
        super(Line, Token, Problem);
        this.inner = inner;
    }
}