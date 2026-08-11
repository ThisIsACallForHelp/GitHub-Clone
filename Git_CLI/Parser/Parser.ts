import {TokenModel } from "./../Lexer/TokenModel.ts";
import { ProgramNode } from "./Nodes/ProgramNode.ts";
import { CommandGroupNode } from "./Nodes/CommandGroupNode.ts";
import { Expression } from "./Nodes/Expression.ts";
import { IfNode } from "./Nodes/IfNode.ts";
import { ForNode } from "./Nodes/ForNode.ts";
import { WhileNode } from "./Nodes/WhileNode.ts";
import { CaseNode } from "./Nodes/CaseNode.ts";
import { PipelineNode } from "./Nodes/PipelineNode.ts";
import { ArgumentNode } from "./Nodes/ArgumentNode.ts";
import { RedirectionsNode } from "./Nodes/RedirectionsNode.ts";
import { VariableBracedNode } from "./Nodes/VariableBracedNode.ts";
import { VariableNode } from "./Nodes/VariableNode.ts";
import { UntilNode } from "./Nodes/UntilNode.ts";
import { AssignmentNode } from "./Nodes/AssignmentNode.ts";
import { CommandListNode } from "./Nodes/CommandListNode.ts";
import { CommandSubNode } from "./Nodes/CommandSubNode.ts";
import { FunctionNode } from "./Nodes/FunctionNode.ts";
import { HereDocNode } from "./Nodes/HereDocNode.ts";
import { LogicalExpressionNode } from "./Nodes/LogicalExpressionNode.ts";
import { SimpleCommandNode } from "./Nodes/SimpleCommandNode.ts";
import { StringNode } from "./Nodes/StringNode.ts";
import { SubshellNode } from "./Nodes/SubshellNode.ts";
import {Tokens } from "../Lexer/LexerTokens.ts"
export class Parser{
    public lexerTokens : TokenModel[];
    private _position : number;
    public constructor(LexerTokens : TokenModel[]){
        this.lexerTokens = LexerTokens;
        this._position = 0;
    }
    ManipPtr(offset : number, MovePtr : boolean) : TokenModel | null{
        if(this._position + offset >= this.lexerTokens.length){
            return null;
        }
        this._position += (MovePtr) ? offset : 0;
        return this.lexerTokens[this._position + offset];
    }
    MatchAndMove(expectedToken : Tokens){
        const CurrToken = this.ManipPtr(0,false)
        if(CurrToken?.TokenType === expectedToken){
            this.ManipPtr(1,true);
            return CurrToken;
        }
        throw new Error("unexpected token");
    }
    parseStatement() : Statement | null{
        return null;
    }
    parseCommandGroup() : CommandGroupNode{

    }
    parseExpression() : Expression{

    }
    parseIfStatement() : IfNode{
        this.ManipPtr(1,true) //consume the if token 
        let condition : Expression = this.parseExpression();
        this.MatchAndMove(Tokens.THEN);
        let ifTrue : CommandListNode = this.parseCommandList();
        this.MatchAndMove(Tokens.ENDIF);
        //check if there is an else clause
        let ElseClause = null;
        if(this.ManipPtr(1,false)?.TokenType === Tokens.ELSE){ 
            this.ManipPtr(1,true); //consume the else token
            if(this.ManipPtr(1,false)?.TokenType === Tokens.IF){
                return new IfNode(0,Tokens.IF, "", Tokens.IF, condition, ifTrue, this.parseIfStatement())/
            } //check if its an else-if 
        }
        return new IfNode(0 ,Tokens.IF, "", Tokens.IF, condition, ifTrue, ElseClause)/


    }
    parseForLoop() : ForNode{

    }
    parseWhileLoop() : WhileNode{

    }
    parseCaseStatement() : CaseNode{

    }
    parsePipeline() : PipelineNode{

    }
    parseArgs() : ArgumentNode{

    }
    parseRedirections() : RedirectionsNode{

    }
    parseVars() : VariableBracedNode | VariableNode{
        return new VariableBracedNode();
    }
    parseUntilLoop() : UntilNode{

    }
    parseArithmectic() : ArithmeticNode{

    }
    parseAssignment() : AssignmentNode{

    }
    parseCommandList() : CommandListNode{

    }
    parseCommandSub() : CommandSubNode{

    }
    parseFunctionDeclaration() : FunctionNode{

    }
    parseHereDoc() : HereDocNode{

    }
    parseLogicalExpression() : LogicalExpressionNode{

    }
    parseProgram() : ProgramNode{

    }
    parseSimpleCommand() : SimpleCommandNode{

    }
    parseString() : StringNode{

    }
    parseSubshell() : SubshellNode{

    }
    parseWord() : WordNode{

    }
}