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
        ["(", Tokens.OPEN_SUBSHELL],
        [")", Tokens.CLOSE_SUBSHELL],
        ["{", Tokens.OPEN_COMMAND_GROUP],
        ["}", Tokens.CLOSE_COMMAND_GROUP],
        ["=", Tokens.ASSIGNMENT],
        ["`", Tokens.COMMAND_SUB_BACKTICK],
        ["$", Tokens.VARIABLE],
        ["${", Tokens.VARIABLE_BRACED],
        ["$((", Tokens.ARITHMETIC],
        ["[[", Tokens.DOUBLE_OPEN_SQUARED],
        ["]]", Tokens.DOUBLE_CLOSE_SQUARED],
        ["$(", Tokens.COMMAND_SUB],
        ["#", Tokens.COMMENT],
    ]);

    public Text : string = ""; 
    public _TextPosition : number = 0;
    public constructor(TokenText : string){
        this.Text = TokenText; //get the code
        this._TextPosition = 0;  //set the starting position 
    }
    private CanBeIgnored(IgnoredChar : string) : boolean{
        return (IgnoredChar === ' ' || IgnoredChar === '\t' || IgnoredChar === '\n');
    }
    public Peek(Pos : number) : string{
        if(this._TextPosition + Pos >= this.Text.length){
            return '\0';
        }
        return this.Text[this._TextPosition + Pos];
    }
    public MovePtr(Offset : number) : string{
        if(this._TextPosition + Offset >= this.Text.length){
            return '\0'; 
        }
        this._TextPosition += Offset; //increment the position by the offset 
        return this.Text[this._TextPosition]; //return the next char and increment the position 
    }

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
        let currentChar = this.Peek(0);
        let NextChar = this.Peek(1);
        if(this._TextPosition >= this.Text.length){
            return new TokenModel(Tokens.EOF, "\0", this._TextPosition);
        }

        else if(this.CanBeIgnored(currentChar)){
            while(currentChar !== '\0' && this.CanBeIgnored(currentChar)){
                currentChar = this.MovePtr(1);
            }
            return this.GetNextToken();
        }

        if(currentChar === '\0'){
            return new TokenModel(Tokens.EOF, "\0", this._TextPosition);
        }
        else if(currentChar === '#'){
            const startPos : number = this._TextPosition;
            let value : string = "";
            let Curr : string = this.Peek(0);
            while(Curr !== '\0' && Curr !== '\n'){
                value += this.MovePtr(1);
                Curr = this.Peek(0);
            }
            return new TokenModel(Tokens.COMMENT, value, startPos);
        }
        else if(currentChar === '`'){
            this.MovePtr(1);
            const startPos = this._TextPosition;    
            let value = "";
            let Curr = this.Peek(0);
            while(Curr !== '\0' && Curr !== '`'){
                value += this.MovePtr(1);
                Curr = this.Peek(0);
            }
            this.MovePtr(1);
            return new TokenModel(Tokens.COMMAND_SUB_BACKTICK, value, startPos);
        }
        else if(currentChar === '\''){
            this.MovePtr(1);
            const startPos = this._TextPosition;
            let value = "";
            let CurrChar = this.Peek(0);
            while(CurrChar !== '\0' && CurrChar !== '\''){
                value += this.MovePtr(1);
                CurrChar = this.Peek(0);
            }
            this.MovePtr(1); 
            return new TokenModel(Tokens.STRING, value, startPos);
        }
        else if (currentChar === '$') {
    const startPos = this._TextPosition;
    const n1 = this.Peek(1);
    const n2 = this.Peek(2);

    // arithmetic: $(( ... ))
    if (n1 === '(' && n2 === '(') {
        let value = "$((";
        this.MovePtr(1); this.MovePtr(1); this.MovePtr(1); // consume $ and two (
        let depth = 1;
        let ch = this.Peek(0);
        while (ch !== '\0') {
            if (ch === '(') { depth++; value += this.MovePtr(1); }
            else if (ch === ')') {
                // consume one ) and check if final ) follows
                value += this.MovePtr(1);
                if (this.Peek(0) === ')') { value += this.MovePtr(1); depth--; if (depth === 0) break; }
                else { depth--; }
            } else { value += this.MovePtr(1); }
            ch = this.Peek(0);
        }
        return new TokenModel(Tokens.ARITHMETIC, value, startPos);
    }

    // braced: ${ ... }
    if (n1 === '{') {
        let value = "$";
        value += this.MovePtr(1); // consume $
        value += this.MovePtr(1); // consume {
        let depth = 1;
        let ch = this.Peek(0);
        while (ch !== '\0') {
            if (ch === '{') { depth++; value += this.MovePtr(1); }
            else if (ch === '}') { value += this.MovePtr(1); depth--; if (depth === 0) break; }
            else { value += this.MovePtr(1); }
            ch = this.Peek(0);
        }
        return new TokenModel(Tokens.VARIABLE_BRACED, value, startPos);
    }

        // command substitution: $( ... )
        if (n1 === '(') {
            let value = "$";
            value += this.MovePtr(1); // consume $
            value += this.MovePtr(1); // consume (
            let depth = 1;
            let ch = this.Peek(0);
            while (ch !== '\0') {
                if (ch === '(') { depth++; value += this.MovePtr(1); }
                else if (ch === ')') { value += this.MovePtr(1); depth--; if (depth === 0) break; }
                else { value += this.MovePtr(1); }
                ch = this.Peek(0);
            }
            return new TokenModel(Tokens.COMMAND_SUB, value, startPos);
        }

        // plain $name / special params
        this.MovePtr(1); // consume $
        let value = "$";
        let ch = this.Peek(0);
        if (ch === '\0') return new TokenModel(Tokens.VARIABLE, value, startPos);
        if (['#','?','*','@','-','$','!'].includes(ch) || (ch >= '0' && ch <= '9')) {
            value += this.MovePtr(1);
            return new TokenModel(Tokens.VARIABLE, value, startPos);
        }
        if (/^[A-Za-z_]$/.test(ch)) {
            value += this.MovePtr(1);
            ch = this.Peek(0);
            while (/^[A-Za-z0-9_]$/.test(ch)) { value += this.MovePtr(1); ch = this.Peek(0); }
            return new TokenModel(Tokens.VARIABLE, value, startPos);
        }

        return new TokenModel(Tokens.UNKNOWN_TOKEN, value, startPos);
    }

        else if(this.CheckIfSymbol(currentChar)){
            const startPos = this._TextPosition;
            let SymbolCode : string = currentChar;
            while(true){
                const next = this.Peek(1);
                if(next === '\0'){
                    break;
                }
                const tempSymbol = SymbolCode + next;
                if(Lexer.SymbolMap.has(tempSymbol)){
                    this.MovePtr(1);
                    SymbolCode += next;
                }
                else{
                    break;
                }
            }
            return new TokenModel(Lexer.SymbolMap.get(SymbolCode) || Tokens.UNKNOWN_TOKEN, SymbolCode, startPos);
        }

        else if(this.CheckIfChar(currentChar)){
            const startPos = this._TextPosition;
            let Identifier : string = currentChar;
            while(NextChar !== '\0' && (this.CheckIfChar(NextChar) || this.CheckIfNumber(NextChar))){
                currentChar = this.MovePtr(1);
                NextChar = this.Peek(1);
                Identifier += currentChar;
            }
            return new TokenModel(Lexer.KeywordMap.get(Identifier) || Tokens.WORD, Identifier, startPos);
        }

        else if(this.CheckIfNumber(currentChar)){
            const startPos = this._TextPosition;
            let NumberLiteral : string = currentChar;
            while(NextChar !== '\0' && (this.CheckIfNumber(NextChar) || (NextChar === '.' && this.CheckIfNumber(this.Peek(2))))){
                NumberLiteral += this.MovePtr(1);
                NextChar = this.Peek(1);
            }
            return new TokenModel(Tokens.NUMBER, NumberLiteral, startPos);
        }

        else if(currentChar === '"'){
            const startPos = this._TextPosition;
            this.MovePtr(1);
            let value = "";
            let ch = this.Peek(0);
            while(ch !== '\0' && ch !== '"'){
                if(ch === '\\'){
                    this.MovePtr(1);
                    const esc = this.Peek(0);
                    if(esc === '\0') break;
                    value += this.MovePtr(1);
                } else {
                    value += this.MovePtr(1);
                }
                ch = this.Peek(0);
            }
            if(this.Peek(0) === '"'){
                this.MovePtr(1); 
                return new TokenModel(Tokens.STRING, value, startPos);
            }
            return new TokenModel(Tokens.UNKNOWN_TOKEN, value, startPos);
        }
        return new TokenModel(Tokens.UNKNOWN_TOKEN, "\0", this._TextPosition);    
    }
}