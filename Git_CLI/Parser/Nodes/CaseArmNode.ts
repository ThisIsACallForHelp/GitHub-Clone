import { CommandListNode } from "./CommandListNode";

export class CaseArmNode extends ASTNode{
    patterns: string[];
    body: CommandListNode;
    next: CaseArmNode | null;
    public constructor(Line : number , Token : number, Problem : string, patterns: string[], body: CommandListNode, next: CaseArmNode | null){
        super(Line, Token, Problem);
        this.patterns = patterns;
        this.body = body;
        this.next = next;
    }
}