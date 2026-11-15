import { Statement } from "./Statement.ts";
import { CommandListNode } from "./CommandListNode.ts";
import type { TokenModel } from "../../Lexer/TokenModel.ts";
export class FunctionNode extends Statement{
    public funcName : string | null;
    public funcParams : CommandListNode | null;
    public funcBody : CommandListNode | null;
    public constructor(astToken : TokenModel, FuncName: string | null, 
                       FuncParams: CommandListNode | null, 
                       FuncBody: CommandListNode | null){
        super(astToken);
        this.funcName = FuncName;
        this.funcParams = FuncParams;
        this.funcBody = FuncBody;
    }

}