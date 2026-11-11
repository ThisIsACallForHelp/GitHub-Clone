import { Tokens } from "./LexerTokens.ts";
import { TokenModel } from "./TokenModel.ts";
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
        ["coproc", Tokens.COPROC],
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
        ["(", Tokens.OPEN_PARENTHESIS],
        [")", Tokens.CLOSE_PARENTHESIS],
        ["{", Tokens.OPEN_BRACE],
        ["}", Tokens.CLOSE_BRACE],
        ["=", Tokens.EQUALS],
        ["+=", Tokens.PLUS_EQUALS],
        ["-=", Tokens.MINUS_EQUALS],
        ["*=", Tokens.ASTRIX_EQUALS],
        ["/=", Tokens.SLASH_EQUALS],
        ["++", Tokens.PLUS_PLUS],
        ["--", Tokens.MINUS_MINUS],
        ["`", Tokens.COMMAND_SUB_BACKTICK],
        ["$", Tokens.VARIABLE],
        ["${", Tokens.VARIABLE_BRACED],
        ["$((", Tokens.ARITHMETIC],
        ["$(", Tokens.COMMAND_SUB],
        ["[[", Tokens.DOUBLE_OPEN_SQUARED],
        ["]]", Tokens.DOUBLE_CLOSE_SQUARED],
        ["#", Tokens.COMMENT],
        [":-", Tokens.DEFAULT_FALLBACK],
        [":=", Tokens.ASSIGN_FALLBACK],
        [":+", Tokens.ALTERNATE_FALLBACK],
        [":?", Tokens.ERROR_FALLBACK],
        ["))", Tokens.END_ARITHMETIC]
    ]);
    private _lineNumber : number = 0;
    private _charNumber : number = 0;
    public Text : string = ""; 
    private _TextPosition : number = 0;
    public constructor(TokenText : string){
        this.Text = TokenText; //get the code
        this._TextPosition = 0;  //set the starting position 
    }
    public Peek(Pos : number) : string{
        if(this._TextPosition + Pos >= this.Text.length){
            return '\0';
        }
        return this.Text[this._TextPosition + Pos]!;
    }
    public MovePtr(Offset : number) : string{
        if(this._TextPosition + Offset >= this.Text.length){
            return '\0'; 
        }
        this._TextPosition += Offset; //increment the position by the offset 
        this._charNumber += Offset;
        return this.Text[this._TextPosition]!; //return the next char and increment the position 
    }

    private CheckIfSymbol(Test: string ) : boolean{
        return Lexer.SymbolMap.has(Test);
    }
    private CheckIfChar(Test : string) : boolean{
        return (/^[a-zA-Z]$/.test(Test)) || Test.includes('_') || ['?','*','@','-','$','!'].includes(Test);
    }
    private CheckIfNumber(Test : string) : boolean{
        if(Test >= '0' && Test <= '9'){
            return true; 
        }
        return false;
    }

    
    public GetNextToken() : TokenModel{
        let currentChar = this.Peek(0);
        let NextChar = this.Peek(1);
        let tokenValue : string = "";
        if(this._TextPosition >= this.Text.length){
            return new TokenModel(Tokens.EOF, "\0", this._charNumber, this._lineNumber);
        }
        if(currentChar === '\n'){
            this._charNumber = 0;
            while(currentChar !== '\0' && currentChar === '\n'){
                this._lineNumber++;
                currentChar = this.MovePtr(1);
            }
            return this.GetNextToken();
        }
        else if(currentChar === ' '){
            while(currentChar !== '\0' && currentChar === ' '){
                this._charNumber++;
                currentChar = this.MovePtr(1);
            }
            return this.GetNextToken();
        }
        else if(currentChar === '\t'){
            while(currentChar !== '\0' && currentChar === '\t'){
                currentChar = this.MovePtr(1);
            }
            return this.GetNextToken();
        }

        if(currentChar === '\0'){
            return new TokenModel(Tokens.EOF, "\0", this._charNumber, this._lineNumber);
        }
        else if(currentChar === '#'){
            const startPos : number = this._charNumber;
            let Curr : string = this.Peek(0);
            while(Curr !== '\0' && Curr !== '\n'){
                tokenValue += this.MovePtr(1);
                Curr = this.Peek(0);
            }
            return new TokenModel(Tokens.COMMENT, tokenValue, startPos, this._lineNumber);
        }
        else if(currentChar === '\''){
            this.MovePtr(1);
            const startPos = this._TextPosition;
            let CurrChar = this.Peek(0);
            while(CurrChar !== '\0' && CurrChar !== '\''){
                tokenValue += this.MovePtr(1);
                CurrChar = this.Peek(0);
            }
            this.MovePtr(1); 
            return new TokenModel(Tokens.STRING, tokenValue, startPos, this._lineNumber);
        }
        else if(this.CheckIfSymbol(currentChar)){
            const startPos = this._charNumber;
            tokenValue = currentChar;
            while(true){
                const next = this.Peek(1);
                if(next === '\0'){
                    break;
                }
                const tempSymbol = tokenValue + next;
                if(Lexer.SymbolMap.has(tempSymbol)){
                    this.MovePtr(1);
                    tokenValue += next;
                }
                else{
                    break;
                }
            }
            return new TokenModel(Lexer.SymbolMap.get(tokenValue) || Tokens.UNKNOWN_TOKEN,
             tokenValue, startPos, this._lineNumber);
        }
        else if(this.CheckIfChar(currentChar)){
            const startPos = this._charNumber;
            tokenValue = currentChar;
            while(NextChar !== '\0' && (this.CheckIfChar(NextChar) || this.CheckIfNumber(NextChar))){
                currentChar = this.MovePtr(1);
                NextChar = this.Peek(1);
                tokenValue += currentChar;
            }
            return new TokenModel(Lexer.KeywordMap.get(tokenValue) || Tokens.WORD,
             tokenValue, startPos, this._lineNumber);
        }
        else if(this.CheckIfNumber(currentChar)){
            const startPos = this._charNumber;
            tokenValue = currentChar;
            while(NextChar !== '\0' && (this.CheckIfNumber(NextChar) || (NextChar === '.' && this.CheckIfNumber(this.Peek(2))))){
                tokenValue += this.MovePtr(1);
                NextChar = this.Peek(1);
            }
            return new TokenModel(Tokens.NUMBER, tokenValue, startPos, this._lineNumber);
        }
        else if(currentChar === '"'){
            const startPos = this._charNumber;
            this.MovePtr(1);
            let ch = this.Peek(0);
            while(ch !== '\0' && ch !== '"'){
                if(ch === '\\'){
                    this.MovePtr(1);
                    const esc = this.Peek(0);
                    if(esc === '\0') break;
                    tokenValue += this.MovePtr(1);
                } else {
                    tokenValue += this.MovePtr(1);
                }
                ch = this.Peek(0);
            }
            if(this.Peek(0) === '"'){
                this.MovePtr(1); 
                return new TokenModel(Tokens.STRING, tokenValue, startPos, this._lineNumber);
            }
            return new TokenModel(Tokens.UNKNOWN_TOKEN, tokenValue, startPos, this._lineNumber);
        }
        return new TokenModel(Tokens.UNKNOWN_TOKEN, "\0", this._charNumber, this._lineNumber);    
    }
}