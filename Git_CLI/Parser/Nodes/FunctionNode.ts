import { Statement } from "./Statement.ts";
import { CommandListNode } from "./CommandListNode.ts";
import { Tokens } from "../../Lexer/LexerTokens.ts";
export class FunctionNode extends Statement{
    public funcName : string | null;
    public funcParams : CommandListNode | null;
    public funcBody : CommandListNode | null;
    public constructor(Line : number , Token : Tokens, 
                       Problem : string, FuncName: string | null, 
                       FuncParams: CommandListNode | null, 
                       FuncBody: CommandListNode | null){
        super(Line, Token, Problem);
        this.funcName = FuncName;
        this.funcParams = FuncParams;
        this.funcBody = FuncBody;
    }

}