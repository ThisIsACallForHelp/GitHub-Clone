import { Statement } from "./Statement";
import { CommandListNode } from "./CommandListNode";
export class FunctionNode extends Statement{
    public FuncName : string;
    public FuncParams : CommandListNode | null;
    public FuncBody : CommandListNode | null;
    public constructor(Line : number , Token : number, Problem : string, FuncName: string, FuncParams: CommandListNode | null, FuncBody: CommandListNode | null){
        super(Line, Token, Problem);
        this.FuncName = FuncName;
        this.FuncParams = FuncParams;
        this.FuncBody = FuncBody;
    }

}