export class ASTNode{
    public LineNumber : number = 0;
    public TokenNumber : number = 0;
    public ProblemString : string = "";
    constructor(Line : number, Token : number, Problem : string){
        this.LineNumber = Line;
        this.TokenNumber = Token;
        this.ProblemString = Problem;
    }
}