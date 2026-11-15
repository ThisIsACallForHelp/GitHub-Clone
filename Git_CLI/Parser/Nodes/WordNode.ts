import { Expression } from "./Expression.ts";
import type { TokenModel } from "../../Lexer/TokenModel.ts";
export class WordNode extends Expression{
    public raw : string;
    public constructor(astToken : TokenModel, Content : string)
    {
        super(astToken);
        this.raw = Content;
    }
}