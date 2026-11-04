
import { CommandListNode } from "./CommandListNode.ts";
import { ASTNode } from "./ASTNode.ts";
import { Tokens } from "../../Lexer/LexerTokens.ts";
export class ProgramNode extends ASTNode{
    public code : CommandListNode;
    public constructor(Line : number , Token : Tokens, 
                       Problem : string, Code: CommandListNode)
    {
        super(Line, Token, Problem);
        this.code = Code;
    }
}