import {TokenModel } from "../Lexer/TokenModel.ts";
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
import { Statement } from "./Nodes/Statement.ts";
import { ArithmeticNode } from "./Nodes/ArithmeticNode.ts";
import { CaseArmNode } from "./Nodes/CaseArmNode.ts";
import {WordNode} from "./Nodes/WordNode.ts"
export class Parser{
    private _lexerTokens : TokenModel[];
    private _position : number;
    public constructor(_lexerTokens : TokenModel[]){
        this._lexerTokens = _lexerTokens;
        this._position = 0;
    }

    getCurrTokenModel() : TokenModel{
        if(!this._lexerTokens[this._position] || this._lexerTokens[this._position]?.TokenType == Tokens.EOF){
            return new TokenModel(Tokens.EOF, '\0',
                 this._position, this._lexerTokens[this._lexerTokens.length - 1]?.tokenLine!);
        }
        return this._lexerTokens[this._position]!;
    }
    moveForwardManyTimes(offset : number) : TokenModel{
        if(this.isOutOfBoundary()){
            return new TokenModel(Tokens.EOF, '\0',
                this._lexerTokens[this._lexerTokens.length - 1]?.StartingPosition!,
                this._lexerTokens[this._lexerTokens.length - 1]?.tokenLine!);
        }
        this._position += offset;
        return this._lexerTokens[this._position + offset]!;
    }
    matchAndMove(expectedToken : Tokens){
        const prevToken = this._lexerTokens[this._position];
        if(prevToken?.TokenType === expectedToken){
            this._position++;
            return prevToken;
        }
        throw new Error("unexpected token");
    }
    isOutOfBoundary(offset : number =  1) : boolean{
        if(this._position + offset >= this._lexerTokens.length){
            return true;
        }
        return false;
    }
    peekToken(offset : number = 1) : TokenModel{
        return (!this.isOutOfBoundary(offset)) ? 
        this._lexerTokens[this._position + offset]! :
        new TokenModel(Tokens.EOF, '\0',
        this._lexerTokens[this._lexerTokens.length - 1]?.StartingPosition!,
        this._lexerTokens[this._lexerTokens.length - 1]?.tokenLine!);
    }
    advance() : TokenModel | null
    {
        if(!this._lexerTokens[this._position+1] ||
            (this._lexerTokens[this._position+1] && 
            this._lexerTokens[this._position+1]!.TokenType === Tokens.EOF)
        ){
            return null;
        }
        this._position++;
        return this._lexerTokens[this._position]!;
    }
    parseStatement() : Statement | null{
        let currentToken = this.getCurrTokenModel();
        if(!currentToken || currentToken.TokenType === Tokens.EOF){
            return null;
        }
        switch(currentToken!.TokenType){
            case Tokens.IF:
                return this.parseIfStatement();
            case Tokens.FOR:
                return this.parseForLoop();
            case Tokens.WHILE:
                return this.parseWhileLoop();
            case Tokens.UNTIL:
                return this.parseUntilLoop();
            case Tokens.CASE:
                return this.parseCaseStatement();

            case Tokens.OPEN_BRACE:
                return this.parseCommandGroup();
            case Tokens.OPEN_PARENTHESIS:
                return this.parseSubshell();

            case Tokens.FUNCTION:
                return this.parseFunctionDeclaration();

            case Tokens.SEMICOLON:
            case Tokens.BACKGROUND:
            case Tokens.COMMENT:
                return null;
            default: 
                return this.parsePipeline();
        }
    }
    parseCommandGroup() : CommandGroupNode{
        let astToken : TokenModel = this.getCurrTokenModel();
        this.matchAndMove(Tokens.OPEN_BRACE);
        const groupBody = this.parseCommandList(Tokens.OPEN_BRACE, [Tokens.CLOSE_BRACE]);
        this.matchAndMove(Tokens.CLOSE_BRACE);
        return new CommandGroupNode(astToken, groupBody);
    }
    private parsePrimaryExpression() : Expression | null{
        //maybe make this code cleaner??

        type tokenFunc = () => Expression;
        const funcsForEachToken = new Map<Tokens,tokenFunc>([
            [Tokens.WORD, () => this.parseWord()],
            [Tokens.NUMBER, () => this.parseWord()],
            [Tokens.STRING, () => this.parseString()],
            [Tokens.VARIABLE, () => this.parseVars()],
            [Tokens.VARIABLE_BRACED, () => this.parseVars()],
            [Tokens.COMMAND_SUB, () => this.parseCommandSub()],
            [Tokens.COMMAND_SUB_BACKTICK, () => this.parseCommandSub()],
            [Tokens.ARITHMETIC,() => this.parseArithmectic()]
        ]);
        let currentToken = this.getCurrTokenModel();
        if(!currentToken) { return null;}
        const expressionParser = funcsForEachToken.get(currentToken.TokenType);
        return (expressionParser) ? expressionParser() : null;
    }
    parseExpression() : Expression | null{
        let astToken : TokenModel = this.getCurrTokenModel();
        let leftSide : Expression = this.parsePrimaryExpression()!;
        if(!leftSide){
            return null;
        }
        let peekedToken = this.getCurrTokenModel()?.TokenType ?? null;
        while(peekedToken && (peekedToken === Tokens.AND || peekedToken === Tokens.OR)){
            
            let operator = this.getCurrTokenModel();
            this.advance();
            let rightSide = this.parsePrimaryExpression();
            peekedToken = this.getCurrTokenModel()?.TokenType ?? null;
            leftSide = new LogicalExpressionNode(astToken, leftSide, rightSide!, operator!.TokenType);
        }
        return leftSide;
    }
    parseIfStatement() : IfNode{
        let astToken = this.getCurrTokenModel();
        this.moveForwardManyTimes(1) //consume the if token 
        let conditions : CommandListNode = this.parseCommandList(Tokens.IF, [Tokens.SEMICOLON]);
        this.matchAndMove(Tokens.SEMICOLON);
        this.matchAndMove(Tokens.THEN);
        let ifTrue : CommandListNode = this.parseCommandList(Tokens.THEN, [Tokens.ENDIF, Tokens.ELSE, Tokens.ELIF]);
        
        let elseClause = null;
        let stopToken = this.getCurrTokenModel()?.TokenType;
        
        if(stopToken === Tokens.ELIF ){ 
            elseClause = this.parseIfStatement();
        }
        else if(stopToken === Tokens.ELSE){
            this.matchAndMove(Tokens.ELSE);
            this.matchAndMove(Tokens.THEN);
            elseClause = this.parseCommandList(Tokens.ELSE, [Tokens.ENDIF]);
            this.matchAndMove(Tokens.ENDIF);
        } else if (stopToken === Tokens.ENDIF) {
            this.matchAndMove(Tokens.ENDIF);
        }
        return new IfNode(astToken, conditions, ifTrue, elseClause);
    }
    parseForLoop() : ForNode{
        let astToken : TokenModel = this.getCurrTokenModel();
        this.matchAndMove(Tokens.FOR);
        this.matchAndMove(Tokens.OPEN_PARENTHESIS);
        const declaredVars = this.parseStatement();
        this.matchAndMove(Tokens.SEMICOLON);
        const condition = this.parseExpression();
        this.matchAndMove(Tokens.SEMICOLON);
        const varActions = this.parseExpression();
        this.matchAndMove(Tokens.CLOSE_PARENTHESIS);
        this.matchAndMove(Tokens.DO);
        const loopBody = this.parseCommandList(Tokens.FOR, [Tokens.DONE]);
        this.matchAndMove(Tokens.DONE);
        return new ForNode(astToken,declaredVars, condition, varActions, loopBody);
    }
    parseWhileLoop() : WhileNode{
        let astToken : TokenModel = this.getCurrTokenModel();
        this.matchAndMove(Tokens.WHILE);
        const condition = this.parseExpression();
        this.matchAndMove(Tokens.DO);
        const loopBody = this.parseCommandList(Tokens.WHILE, [Tokens.DONE]);
        this.matchAndMove(Tokens.DONE);
        return new WhileNode(astToken, condition, loopBody);

    }
    parseCaseStatement() : CaseNode{
        let astToken : TokenModel = this.getCurrTokenModel();
        this.matchAndMove(Tokens.CASE);
        let testedExpression = this.parseExpression();
        this.matchAndMove(Tokens.IN);
        let arms : CaseArmNode[] = [];
        let peeked = this.getCurrTokenModel();
        while(peeked?.TokenType !== Tokens.EOF && peeked?.TokenType !== Tokens.ENDCASE){
            let patterns : string[] = [];
            do{
                if(patterns.length > 0){
                    this.matchAndMove(Tokens.PIPE);
                }
                let currentToken = this.getCurrTokenModel();
                if(currentToken!.TokenType === Tokens.WORD || currentToken!.TokenType === Tokens.STRING
                    || currentToken!.TokenType === Tokens.VARIABLE
                ){
                    patterns.push(currentToken!.TokenValue);
                    this.advance();
                }
                else{
                    throw new Error("unexpected pattern");
                }
                peeked = this.getCurrTokenModel();
            } while(peeked?.TokenType === Tokens.PIPE);
            this.matchAndMove(Tokens.CLOSE_PARENTHESIS);
            let body = this.parseCommandList(Tokens.CLOSE_PARENTHESIS, [Tokens.DOUBLE_SEMICOLON]);
            this.matchAndMove(Tokens.DOUBLE_SEMICOLON);
            let newArm = new CaseArmNode(astToken,patterns,body, null);
            if(arms.length > 0){
                arms[arms.length - 1]!.next = newArm;
            }
            arms.push(newArm);
            peeked = this.getCurrTokenModel();
        }
        this.matchAndMove(Tokens.ENDCASE);
        return new CaseNode(astToken, testedExpression!, (arms.length > 0) ? arms : null);
    }
    parsePipeline() : PipelineNode{
        let astToken : TokenModel = this.getCurrTokenModel();
        let validPipes = [Tokens.PIPE, Tokens.PIPE_AND]
        let isNegated;
        if(this.getCurrTokenModel()?.TokenType === Tokens.NOT){
            isNegated = true;
            this.advance();
        }
        let seperatedCommands : Statement[] = [];
        seperatedCommands.push(this.parseSimpleCommand()!);
        let currentToken = this.getCurrTokenModel();
        while( currentToken && validPipes.includes(currentToken?.TokenType)){
            this.advance();
            seperatedCommands.push(this.parseSimpleCommand()!);
            currentToken = this.getCurrTokenModel();
        }
        const commandList = new CommandListNode(astToken, seperatedCommands);
        return new PipelineNode(astToken, commandList);
    }
    parseArgs() : ArgumentNode{
        let astToken : TokenModel = this.getCurrTokenModel();
        let args : Expression[] = [];
        type parseFunc = () => Expression;
        let tokensAndFuncs = new Map<Tokens,parseFunc>([
            [Tokens.WORD,() => this.parseWord()],
            [Tokens.NUMBER, () => this.parseWord()],
            [Tokens.STRING, () => this.parseString()],
            [Tokens.VARIABLE, () => this.parseVars()],
            [Tokens.COMMAND_SUB, () => this.parseCommandSub()],
            [Tokens.ARITHMETIC, () => this.parseArithmectic()],
            [Tokens.VARIABLE_BRACED, () => this.parseVars()],
            [Tokens.COMMAND_SUB_BACKTICK, () => this.parseCommandSub()]
        ]);
        let currentToken = this.getCurrTokenModel();
        while(currentToken && tokensAndFuncs.has(currentToken!.TokenType)
        ){
            const parserFunc = tokensAndFuncs.get(currentToken.TokenType)!;
            args.push(parserFunc());
            currentToken = this.getCurrTokenModel();
        }
        return new ArgumentNode(astToken, args);
    }
    parseRedirections() : RedirectionsNode{
        let astToken : TokenModel = this.getCurrTokenModel();
        let validRedirects = [Tokens.REDIRECT_ALL, Tokens.REDIRECT_ALL_APPEND,
            Tokens.REDIRECT_APPEND, Tokens.REDIRECT_ERR, Tokens.REDIRECT_ERR_APPEND,
            Tokens.REDIRECT_IN, Tokens.REDIRECT_OUT
        ]
        const leftSide = this.parseExpression();
        const action = this.getCurrTokenModel()?.TokenType;
        if(action === undefined || !(validRedirects.includes(action))){
            throw new Error("invalid redirector");
        }
        this.advance();
        const rightSide = this.parseExpression();
        return new RedirectionsNode(astToken, leftSide!, action, rightSide!);
    }
    parseVars() : VariableBracedNode | VariableNode{
        let astToken : TokenModel = this.getCurrTokenModel();
        let validContinuations = [Tokens.EQUALS, Tokens.ERROR_FALLBACK,Tokens.ASSIGN_FALLBACK,
            Tokens.DEFAULT_FALLBACK,Tokens.ALTERNATE_FALLBACK,Tokens.OR];
        let variableType = this.getCurrTokenModel();
        this.advance(); 
        const varName = this.getCurrTokenModel();
        
        if(variableType && variableType.TokenType === Tokens.VARIABLE){
            this.advance(); 
            return new VariableNode(astToken, varName!.TokenValue, variableType!.TokenType,null);
        }
        
        let expression = null; 
        this.advance(); 
        let operator = this.getCurrTokenModel(); 
        
        if(operator && validContinuations.includes(operator.TokenType)){
            this.advance(); 
            expression = this.parseExpression(); 
        }
        this.matchAndMove(Tokens.CLOSE_BRACE); 
        
        let fallbackType = (operator && validContinuations.includes(operator.TokenType)) ? operator.TokenType : Tokens.VARIABLE_BRACED;
        return new VariableBracedNode(astToken, varName!.TokenValue, fallbackType, expression!)
    }
    parseUntilLoop() : UntilNode{
        let astToken : TokenModel = this.getCurrTokenModel();
        this.advance(); //consume the until token
        let condition = this.parseExpression();
        this.matchAndMove(Tokens.SEMICOLON);
        this.matchAndMove(Tokens.DO);
        let codeBlock = this.parseCommandList(Tokens.UNTIL, [Tokens.DONE]);
        this.matchAndMove(Tokens.DONE);
        return new UntilNode(astToken, condition, codeBlock);
    }
    parseArithmectic() : ArithmeticNode{
        let astToken : TokenModel = this.getCurrTokenModel();
        this.matchAndMove(Tokens.ARITHMETIC);
        const innerExpressions = this.parseExpression();
        this.matchAndMove(Tokens.END_ARITHMETIC);
        return new ArithmeticNode(astToken, innerExpressions!);
    }
    parseAssignment() : AssignmentNode{
        let validOperators = [Tokens.PLUS_PLUS, Tokens.PLUS_EQUALS, Tokens.MINUS_EQUALS, 
            Tokens.ASTRIX_EQUALS, Tokens.SLASH_EQUALS, Tokens.EQUALS, Tokens.ASSIGNMENT
        ];
        let astToken : TokenModel = this.getCurrTokenModel();
        const varName = this.getCurrTokenModel();
        this.advance();
        const assignmentType = this.getCurrTokenModel();
        if(!(validOperators.includes(assignmentType!.TokenType))){
            throw new Error("unexpected assignment type");
        }
        this.advance();
        const rightSide = this.parseExpression();
        return new AssignmentNode(astToken, varName!.TokenValue, assignmentType!.TokenType, rightSide!); 
    }
    parseCommandList(startToken : Tokens ,stopTokens : Tokens[]) : CommandListNode{
        let astToken : TokenModel = this.getCurrTokenModel();
        let codeBlock : Statement[]  = [];
        let currentToken = this.getCurrTokenModel()?.TokenType;
        while(true){
            currentToken = this.getCurrTokenModel()?.TokenType;
            if(!currentToken || currentToken === Tokens.EOF || stopTokens.includes(currentToken)){
                break;
            }
            let currentStatement = this.parseStatement();
            if(currentStatement !== null){
                codeBlock.push(currentStatement);
            }
            else{
                this.advance();
            }
        }
        return new CommandListNode(astToken,codeBlock);
    }
    parseCommandSub() : CommandSubNode{
        let stopTokens = new Map<string, Tokens>([
            ["`", Tokens.COMMAND_SUB_BACKTICK],
            ["(", Tokens.CLOSE_PARENTHESIS],
            ["$(", Tokens.CLOSE_PARENTHESIS]
        ]);
        const astToken : TokenModel = this.getCurrTokenModel();
        const subshellType  = this.getCurrTokenModel();
        let stopToken;
        stopToken = stopTokens.get(subshellType!.TokenValue);
        this.advance(); //consume the ``, or () or $()
        const innerCommands = this.parseCommandList(subshellType!.TokenType, [stopToken!]);
        this.matchAndMove(stopToken!);
        return new CommandSubNode(astToken, innerCommands);
    }
    parseFunctionDeclaration() : FunctionNode{
        const astToken : TokenModel = this.getCurrTokenModel();
        this.matchAndMove(Tokens.FUNCTION);
        const funcName : string | null = this.getCurrTokenModel()?.TokenValue ?? null;
        this.advance();
        this.matchAndMove(Tokens.OPEN_PARENTHESIS);
        const funcParams = this.parseCommandList(Tokens.OPEN_PARENTHESIS, [Tokens.CLOSE_PARENTHESIS])
        this.matchAndMove(Tokens.CLOSE_PARENTHESIS);
        this.matchAndMove(Tokens.OPEN_BRACE);
        const funcBody = this.parseCommandList(Tokens.OPEN_BRACE,[Tokens.CLOSE_BRACE]);
        this.matchAndMove(Tokens.CLOSE_BRACE);
        return new FunctionNode(astToken, funcName, funcParams, funcBody);
    }
    parseHereDoc() : HereDocNode{
        const astToken : TokenModel = this.getCurrTokenModel();
        const command = this.parseStatement();
        const redirector = this.advance()?.TokenType;
        if(redirector && this.IsRedirector(redirector)){
            throw new Error("Wrong redirector");
        }
        const delimeter = this.advance()?.TokenValue;
        const content : string = this.matchAndMove(Tokens.HEREDOC).TokenValue;
        return new HereDocNode(astToken, content, delimeter!, command!);
    }
    parseLogicalExpression() : LogicalExpressionNode{
        const astToken : TokenModel = this.getCurrTokenModel();
        const leftSide = this.parseExpression();
        const operator = this.advance();
        const right = this.parseExpression();
        return new LogicalExpressionNode(astToken,leftSide!, right!, operator!.TokenType);
    }
    parseProgram() : ProgramNode{
        let astToken : TokenModel = this.getCurrTokenModel();
        let commands = this.parseCommandList(Tokens.PROGRAM_TOKEN!, [Tokens.EOF]);
        return new ProgramNode(astToken, commands);
    }
    parseSimpleCommand() : SimpleCommandNode{
        let astToken : TokenModel = this.getCurrTokenModel();
        let assignments : AssignmentNode[] = [];
        let redirectors : RedirectionsNode[]  =[];
        let variableName : Expression | null = null;
        let args : ArgumentNode[] = [];
        const commandTerminators = [
            Tokens.PIPE, Tokens.DOUBLE_SEMICOLON,
            Tokens.PIPE_AND, Tokens.SEMICOLON,
            Tokens.BACKGROUND, Tokens.EOF, Tokens.CLOSE_BRACE,
            Tokens.AND, Tokens.OR, Tokens.CLOSE_PARENTHESIS,
            
            Tokens.DONE, Tokens.ENDCASE, Tokens.ENDIF,
            Tokens.THEN, Tokens.ELIF, Tokens.CLOSE_BRACE
        ];
        let currentToken = this.getCurrTokenModel();
        while(currentToken && !commandTerminators.includes(currentToken.TokenType)){
            let startPosition = this._position;
            let peekedNext = this.moveForwardManyTimes(1);
            if(this.IsRedirector(currentToken.TokenType)){
                redirectors.push(this.parseRedirections());
                currentToken = this.getCurrTokenModel();
                continue;
            }
            if(!variableName &&peekedNext && peekedNext.TokenType === Tokens.ASSIGNMENT){
                assignments.push(this.parseAssignment());
                currentToken = this.getCurrTokenModel();
                continue;
            }
            if(!variableName){
                variableName = this.parseExpression();
                currentToken = this.getCurrTokenModel();
                continue;
            }
            args.push(this.parseArgs()!);
            currentToken = this.getCurrTokenModel();
            if(startPosition === this._position){
                throw new Error("unexpected token while parsing args");
            }
        }
        return new SimpleCommandNode(astToken, variableName, args, redirectors,assignments)
    }
    parseString() : StringNode{
        let astToken : TokenModel = this.getCurrTokenModel();
        const stringToken = this.matchAndMove(Tokens.STRING);
        return new StringNode(astToken, stringToken.TokenValue);
    }
    parseSubshell() : SubshellNode{
        let astToken : TokenModel = this.getCurrTokenModel();
        this.matchAndMove(Tokens.OPEN_PARENTHESIS);
        let subshellStatements = this.parseCommandList(Tokens.OPEN_PARENTHESIS, [Tokens.CLOSE_PARENTHESIS]);
        this.matchAndMove(Tokens.CLOSE_PARENTHESIS);
        return new SubshellNode(astToken, subshellStatements);
    }
    parseWord() : WordNode{
        let astToken : TokenModel = this.getCurrTokenModel();
        const rawWord : string = astToken?.TokenValue!;
        if(!rawWord){
            throw new Error("caught an undefined value while parsing a word token");
        }
        this.advance();
        return new WordNode(astToken, rawWord);
    }
    IsRedirector(Token : Tokens) : boolean{
        let redirectionTypes = [Tokens.REDIRECT_ALL, Tokens.REDIRECT_ALL_APPEND,
            Tokens.REDIRECT_APPEND, Tokens.REDIRECT_ERR, Tokens.REDIRECT_ERR_APPEND,
            Tokens.REDIRECT_IN, Tokens.REDIRECT_OUT
        ];
        return redirectionTypes.includes(Token);
    }
}