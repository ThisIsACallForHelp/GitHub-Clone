import { TokenModel } from "../../Lexer/TokenModel.ts";

export class ASTNode{
    public astToken : TokenModel;
    constructor(token : TokenModel)
    {
        this.astToken = token;
    }
}