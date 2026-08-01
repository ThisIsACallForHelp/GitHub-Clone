import { Tokens } from "./LexerTokens";
import { TokenModel } from "./TokenModel";
export class Lexer{
    private static readonly KeywordMap = new Map<string, Tokens>([
        ["if", Tokens.IF],
        ["then", Tokens.THEN],
        ["elif", Tokens.ELIF],
        ["else", Tokens.ELSE],
        ["endif", Tokens.ENDIF],
        ["case", Tokens.CASE],
        ["endcase", Tokens.ENDCASE],
        ["in", Tokens.IN],
        ["for", Tokens.FOR],
        ["while", Tokens.WHILE],
        ["until", Tokens.UNTIL],
        ["do", Tokens.DO],
        ["done", Tokens.DONE],
        ["select", Tokens.SELECT],
        ["function", Tokens.FUNCTION],
        ["return", Tokens.RETURN],
        ["break", Tokens.BREAK],
        ["continue", Tokens.CONTINUE],
        ["exit", Tokens.EXIT],
        ["export", Tokens.EXPORT],
        ["local", Tokens.LOCAL],
        ["readonly", Tokens.READONLY],
        ["unset", Tokens.UNSET],
        ["declare", Tokens.DECLARE],
        ["source", Tokens.SOURCE],
        ["alias", Tokens.ALIAS],
        ["unalias", Tokens.UNALIAS],
        ["time", Tokens.TIME],
        ["coproc", Tokens.COPROC]
    ]);

    private static readonly SymbolMap = new Map<string, Tokens>([
        ["|", Tokens.PIPE],
        ["|&", Tokens.PIPE_AND],
        ["&&", Tokens.AND],
        ["||", Tokens.OR],
        ["!", Tokens.NOT],
        [";", Tokens.SEMICOLON],
        [";;", Tokens.DOUBLE_SEMICOLON],
        ["&", Tokens.BACKGROUND],
        [">", Tokens.REDIRECT_OUT],
        [">>", Tokens.REDIRECT_APPEND],
        ["<", Tokens.REDIRECT_IN],
        ["<<", Tokens.HEREDOC],
        [">>>", Tokens.HERESTRING],
        ["2>", Tokens.REDIRECT_ERR],
        ["2>>", Tokens.REDIRECT_ERR_APPEND],
        ["&>", Tokens.DUP_OUTPUT],
        ["&>>", Tokens.REDIRECT_ALL_APPEND],
        [">", Tokens.REDIRECT_OUT],
        ["<&", Tokens.DUP_INPUT],
        ["(", Tokens.OPEN_SUBSHELL],
        [")", Tokens.CLOSE_SUBSHELL],
        ["{", Tokens.OPEN_COMMAND_GROUP],
        ["}", Tokens.CLOSE_COMMAND_GROUP],
        ["=", Tokens.ASSIGNMENT],
        ["`", Tokens.COMMAND_SUB_BACKTICK],
    ]);

    public Text : string = ""; 
    public _TextPosition : number = 0;
    public constructor(TokenText : string){
        this.Text = TokenText; //get the code
        this._TextPosition = 0;  //set the starting position 
    }

    public GetNext(Offset : number) : string{
        if(this._TextPosition + Offset >= this.Text.length){
            return '\0'; 
        }
        this._TextPosition += Offset; //increment the position by the offset 
        return this.Text[this._TextPosition]; //return the next char and increment the position 
    }
    private PeekNext : string = this.GetNext(1); 

    private CheckIfSymbol(Test: string ) : boolean{
        return Lexer.SymbolMap.has(Test);
    }
    private CheckIfChar(Test : string) : boolean{
        return (/^[a-zA-Z]$/.test(Test));
    }
    private CheckIfNumber(Test : string) : boolean{
        if(Test >= '0' && Test <= '9'){
            return true; 
        }
        return false;
    }

    
    public GetNextToken() : TokenModel{
        if(this._TextPosition >= this.Text.length){
            return new TokenModel(Tokens.EOF, "\0", this._TextPosition);
        }
        else if(this.Text[this._TextPosition] === ' ' || this.Text[this._TextPosition] === '\t'
                || this.Text[this._TextPosition] === '\n'
        ){
            while(this.Text[this._TextPosition] === ' ' || this.Text[this._TextPosition] === '\t'
                || this.Text[this._TextPosition] === '\n')
            {
                this.GetNext(1);
            }
            return this.GetNextToken();
        }
        const currentChar = this.Text[this._TextPosition];
        if(currentChar === '\0'){
            return new TokenModel(Tokens.EOF, "\0", this._TextPosition);
        }
        else if(this.CheckIfSymbol(currentChar)){
            let SymbolCode : string = currentChar;
            while(this.CheckIfSymbol(currentChar)){
                SymbolCode += this.GetNext(1);
            }
            return new TokenModel(Lexer.SymbolMap.get(SymbolCode) || Tokens.UNKNOWN_TOKEN, SymbolCode, this._TextPosition);
        }
        else if(this.CheckIfChar(currentChar)){
            let Identifier : string = currentChar;
            while(this.CheckIfChar(currentChar) || this.CheckIfNumber(currentChar)){
                Identifier += this.GetNext(1);
            }
            if(Lexer.KeywordMap.has(Identifier)){
                return new TokenModel(Lexer.KeywordMap.get(Identifier) || Tokens.UNKNOWN_TOKEN, Identifier, this._TextPosition);
            }
            return new TokenModel(Tokens.VARIABLE, Identifier, this._TextPosition);
        }
        else if(this.CheckIfNumber(currentChar)){
            let NumberLiteral : string = currentChar;
            while(this.CheckIfNumber(currentChar)){
                NumberLiteral += this.GetNext(1);
            }
            return new TokenModel(Tokens.NUMBER, NumberLiteral, this._TextPosition);
        }
        return new TokenModel(Tokens.UNKNOWN_TOKEN, "\0", this._TextPosition);    
    }
}
