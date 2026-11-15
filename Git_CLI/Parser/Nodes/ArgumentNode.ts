import { TokenModel } from "../../Lexer/TokenModel.ts";
import { Expression } from "./Expression.ts";

export class ArgumentNode extends Expression{
    
    public parts : Expression[];
    public constructor(astToken : TokenModel,parts: Expression[])
    {
        super(astToken);
        this.parts = parts;
    }
}