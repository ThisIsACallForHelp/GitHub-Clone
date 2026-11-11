import {Tokens} from "./LexerTokens.ts";
export class TokenModel{
    public TokenType : Tokens;
    public TokenValue : string;
    public StartingPosition : any;
    public tokenLine : number;
    public constructor(TokenType : Tokens, TokenValue : string, StartPos : number, line : number){
        this.TokenType = TokenType;
        this.TokenValue = TokenValue;
        this.StartingPosition = StartPos;
        this.tokenLine = line;
    }
}