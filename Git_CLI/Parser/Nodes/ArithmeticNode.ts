import { Tokens } from "../../Lexer/LexerTokens";
import { ASTNode } from "./ASTNode";
import {Expression} from "./Expression";

export class ArithmeticNode extends Expression{
    innerExp: Expression;
    public constructor(Line : number , Token : Tokens,
                       Problem : string, innerExp: Expression)
    {
        super(Line, Token, Problem);
        this.innerExp = innerExp;
    }

}

