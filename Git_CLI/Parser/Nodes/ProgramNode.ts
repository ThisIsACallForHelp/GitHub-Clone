
import { CommandListNode } from "./CommandListNode";
import { ASTNode } from "./ASTNode";
import { Tokens } from "../../Lexer/LexerTokens";
export class ProgramNode extends ASTNode{
    public code : CommandListNode;
    public constructor(Line : number , Token : Tokens, 
                       Problem : string, Code: CommandListNode)
    {
        super(Line, Token, Problem);
        this.code = Code;
    }
}