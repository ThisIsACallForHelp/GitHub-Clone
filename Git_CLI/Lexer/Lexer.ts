import { Tokens } from "./LexerTokens";
import { TokenModel } from "./TokenModel";
export class Lexer{
    public Text : string = ""; 
    //the code which the lexer will break down into tokens 
    public _TextPosition : number = 0;
    //the position of each char
    public constructor(TokenText : string){
        this.Text = TokenText; //get the code
        this._TextPosition = 0;  //set the starting position 
    }

    private CheckIfChar(Test : string) : string{
        const ValidTokens : string[]  = ["_" , "-" , "." , "/" , ":" , "$" , "|" , "&" , ";" , "(" ,
                                        ")" , "{" , "}" , ">" , "<" , "!" , "=" , "$" , "?" , "[" , "]" ,
                                        "*" , "~" , "`" , "+" , "-" , "%" , "\"" , "\\" , " " , "," , ";" ,
                                        "#" , "\'", "\n"];
        if(ValidTokens.includes(Test) || /^[a-zA-Z]$/.test(Test)){
            return Test;
        }
        return ''; //check if the char is a valid token
    }
    private CheckIfNumber(Test : string) : boolean{
        if(Test >= '0' && Test <= '9'){
            return true; 
        }
        return false;
    }
    public GetNext(Offset : number) : string{
        if(this._TextPosition + Offset >= this.Text.length){
            return '\0'; //if the position is greater than the length of the code, return EOF
        }
        this._TextPosition += Offset; //increment the position by the offset 
        return this.Text[this._TextPosition]; //return the next char and increment the position 
    }
    public GetNextToken() : TokenModel{
        const currentChar = this.GetNext(0); //get the next char    
        if(this._TextPosition === this.Text.length || currentChar === '\0'){
            return new TokenModel(Tokens.EOF, "\0", this._TextPosition); //if the position is greater than the length of the code, return EOF
        }

        if(this.CheckIfNumber(currentChar)){
            let Tokenstart = this._TextPosition; 
            if(this.CheckIfNumber(this.Text[this._TextPosition])){
                while(this.CheckIfNumber(this.GetNext(1))){
                    this._TextPosition += 1; 
                }
                if(this.Text[this._TextPosition] === '.' && this.CheckIfNumber(this.Text[this._TextPosition + 1])){
                    this.GetNext(1);
                    while(this.CheckIfNumber(this.GetNext(1))){
                        this._TextPosition += 1; 
                    }
                }
            }
            return Tokens.NUMBER;
        }
        if(this.CheckIfChar(currentChar)){
            let String : string = "";
            while(this.CheckIfChar(this.GetNext(1)) !== ""){

            }
        }
        return Tokens.UNKNOWN_TOKEN;
    }
}