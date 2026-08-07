export class Statement extends ASTNode{
    public constructor(Line : number, Token : number, Problem : string){
        super(Line, Token, Problem);
    }
}