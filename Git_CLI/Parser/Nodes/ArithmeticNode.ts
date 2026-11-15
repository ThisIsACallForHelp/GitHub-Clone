import type { TokenModel } from "../../Lexer/TokenModel.ts";
import {Expression} from "./Expression.ts";

export class ArithmeticNode extends Expression{
    innerExp: Expression;
    public constructor(astToken : TokenModel, innerExp: Expression)
    {
        super(astToken);
        this.innerExp = innerExp;
    }

}

