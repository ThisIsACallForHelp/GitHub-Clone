import {Tokens} from "./LexerTokens";
export class TokenModel{
    public TokenType : Tokens;
    public TokenValue : string;
    public StartingPosition : any;
    public constructor(TokenType : Tokens, TokenValue : string, StartPos : number){
        this.TokenType = TokenType;
        this.TokenValue = TokenValue;
        this.StartingPosition = StartPos;
    }
}