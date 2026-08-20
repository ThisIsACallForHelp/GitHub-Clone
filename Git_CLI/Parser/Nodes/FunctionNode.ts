import { Statement } from "./Statement";
import { CommandListNode } from "./CommandListNode";
import { Tokens } from "../../Lexer/LexerTokens";
export class FunctionNode extends Statement{
    public funcName : string;
    public funcParams : CommandListNode | null;
    public funcBody : CommandListNode | null;
    public constructor(Line : number , Token : Tokens, 
                       Problem : string, FuncName: string, 
                       FuncParams: CommandListNode | null, 
                       FuncBody: CommandListNode | null){
        super(Line, Token, Problem);
        this.funcName = FuncName;
        this.funcParams = FuncParams;
        this.funcBody = FuncBody;
    }

}