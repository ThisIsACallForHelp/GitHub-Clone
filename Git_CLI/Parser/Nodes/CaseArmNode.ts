import { CommandListNode } from "./CommandListNode.ts";
import { ASTNode } from "./ASTNode.ts";
import type { TokenModel } from "../../Lexer/TokenModel.ts";
export class CaseArmNode extends ASTNode{
    public patterns: string[];
    public body: CommandListNode;
    public next: CaseArmNode | null;
    public constructor(astToken : TokenModel, patterns: string[],
                       body: CommandListNode, next: CaseArmNode | null)
    {
        super(astToken);
        this.patterns = patterns;
        this.body = body;
        this.next = next;
    }
}