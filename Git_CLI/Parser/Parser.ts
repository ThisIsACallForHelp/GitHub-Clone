import {TokenModel } from "./../Lexer/TokenModel.ts";
export class Parser{
    public lexerTokens : TokenModel[];
    private _position : number;
    public constructor(LexerTokens : TokenModel[]){
        this.lexerTokens = LexerTokens;
        this._position = 0;
    }

    
}