import type { TokenModel } from "../../Lexer/TokenModel.ts";
import { Expression } from "./Expression.ts";
export class StringNode extends Expression{
    public content : string;
    public constructor(astToken : TokenModel, Content : string)
    {
        super(astToken);
        this.content = Content;
    }
}