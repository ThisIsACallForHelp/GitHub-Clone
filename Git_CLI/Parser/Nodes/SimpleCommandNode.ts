import { Statement } from "./Statement";

export class SimpleCommandNode extends Statement{
    public commandName: string;
    public args: string[];
    public constructor(cName: string, argArr: string[], line: number, tokenNum: number, problem: string) 
    {
        super(line, tokenNum, problem);
        this.commandName = cName;
        this.args = argArr;
    }
}