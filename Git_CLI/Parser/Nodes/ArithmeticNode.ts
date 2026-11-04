import { Tokens } from "../../Lexer/LexerTokens.ts";
import { ASTNode } from "./ASTNode.ts";
import {Expression} from "./Expression.ts";

export class ArithmeticNode extends Expression{
    innerExp: Expression;
    public constructor(Line : number , Token : Tokens,
                       Problem : string, innerExp: Expression)
    {
        super(Line, Token, Problem);
        this.innerExp = innerExp;
    }

}

