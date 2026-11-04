import { CommandListNode } from "./CommandListNode.ts";
import { ASTNode } from "./ASTNode.ts";
import { Tokens } from "../../Lexer/LexerTokens.ts";
export class CaseArmNode extends ASTNode{
    public patterns: string[];
    public body: CommandListNode;
    public next: CaseArmNode | null;
    public constructor(Line : number , Token : Tokens, 
                       Problem : string, patterns: string[],
                       body: CommandListNode, next: CaseArmNode | null)
    {
        super(Line, Token, Problem);
        this.patterns = patterns;
        this.body = body;
        this.next = next;
    }
}