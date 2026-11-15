
import { CommandListNode } from "./CommandListNode.ts";
import { ASTNode } from "./ASTNode.ts";
import type { TokenModel } from "../../Lexer/TokenModel.ts";
export class ProgramNode extends ASTNode{
    public code : CommandListNode;
    public constructor(astToken : TokenModel, Code: CommandListNode)
    {
        super(astToken);
        this.code = Code;
    }
}