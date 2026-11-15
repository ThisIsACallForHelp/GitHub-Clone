import { TokenModel } from "../../Lexer/TokenModel.ts";
import { ASTNode } from "./ASTNode.ts";
export class Expression extends ASTNode{
    public constructor(astToken : TokenModel)
    {
        super(astToken);
    }
}