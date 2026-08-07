import { Statement } from "./Statement";

export class CommandListNode extends Statement{
    public Commands : Statement[];
    public constructor(Line : number , Token : number, Problem : string, Commands: Statement[]){
        super(Line, Token, Problem);
        this.Commands = Commands;
    }
}