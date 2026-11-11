
import type { TokenModel } from "../../Lexer/TokenModel.ts";
import { ASTNode } from "./ASTNode.ts";
export class Statement extends ASTNode{
    public constructor(astToken:TokenModel)
    {
        super(astToken);
    }
}