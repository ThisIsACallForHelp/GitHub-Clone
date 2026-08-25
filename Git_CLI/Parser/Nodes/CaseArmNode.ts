import { CommandListNode } from "./CommandListNode";
import { ASTNode } from "./ASTNode";
import { Tokens } from "../../Lexer/LexerTokens";
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