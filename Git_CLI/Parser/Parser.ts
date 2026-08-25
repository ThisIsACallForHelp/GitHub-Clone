import {TokenModel } from "../Lexer/TokenModel";
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
    public lexerTokens : TokenModel[];
    private _position : number;
    public constructor(LexerTokens : TokenModel[]){
        this.lexerTokens = LexerTokens;
        this._position = 0;
    }
    getSpecificToken(offset : number, movePointer : boolean = false) : TokenModel | null{
        if(this._position + offset >= this.lexerTokens.length){
            return null;
        }
        this._position += (movePointer) ? offset : 0;
        return this.lexerTokens[(movePointer) ? this._position : this._position + offset];
    }
    MatchAndMove(expectedToken : Tokens){
        const prevToken = this.lexerTokens[this._position];
        if(prevToken?.TokenType === expectedToken){
            this._position++;
            return prevToken;
        }
        throw new Error("unexpected token");
    }
    advance() : Tokens | null
    {
        if(!this.lexerTokens[this._position+1] ||
            this.lexerTokens[this._position+1].TokenType === Tokens.EOF
        ){
            return null;
        }
        this._position++;
        return this.lexerTokens[this._position].TokenType;
    }
    parseStatement() : Statement | null{
        let currentToken = this.getSpecificToken(0);
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
        this.MatchAndMove(Tokens.OPEN_BRACE);
        const groupBody = this.parseCommandList(Tokens.OPEN_BRACE, [Tokens.CLOSE_BRACE]);
        this.MatchAndMove(Tokens.CLOSE_BRACE);
        return new CommandGroupNode(0, Tokens.OPEN_BRACE, "", groupBody);
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
        let currentToken = this.getSpecificToken(0);
        if(!currentToken) { return null;}
        const expressionParser = funcsForEachToken.get(currentToken.TokenType);
        return (expressionParser) ? expressionParser() : null;
    }
    parseExpression() : Expression | null{
        let leftSide : Expression = this.parsePrimaryExpression()!;
        if(!leftSide){
            return null;
        }
        let peekedToken = this.getSpecificToken(0)?.TokenType ?? null;
        while(peekedToken && (peekedToken === Tokens.AND || peekedToken === Tokens.OR)){
            let operator = this.getSpecificToken(0);
            this.getSpecificToken(1,true);
            let rightSide = this.parsePrimaryExpression();
            peekedToken = this.getSpecificToken(0)?.TokenType ?? null;
            leftSide = new LogicalExpressionNode(0, operator!.TokenType, "", leftSide, rightSide!, operator!.TokenType);
        }
        return leftSide;
    }
    parseIfStatement() : IfNode{
        this.getSpecificToken(1,true) //consume the if token 
        let conditions : CommandListNode = this.parseCommandList(Tokens.IF, [Tokens.SEMICOLON]);
        this.MatchAndMove(Tokens.SEMICOLON);
        this.MatchAndMove(Tokens.THEN);
        let ifTrue : CommandListNode = this.parseCommandList(Tokens.THEN, [Tokens.ENDIF, Tokens.ELSE, Tokens.ELIF]);
        
        let elseClause = null;
        let stopToken = this.getSpecificToken(0)?.TokenType;
        
        if(stopToken === Tokens.ELIF ){ 
            elseClause = this.parseIfStatement();
        }
        else if(stopToken === Tokens.ELSE){
            this.MatchAndMove(Tokens.ELSE);
            this.MatchAndMove(Tokens.THEN);
            elseClause = this.parseCommandList(Tokens.ELSE, [Tokens.ENDIF]);
            this.MatchAndMove(Tokens.ENDIF);
        } else if (stopToken === Tokens.ENDIF) {
            this.MatchAndMove(Tokens.ENDIF);
        }
        return new IfNode(0 ,Tokens.IF, "", Tokens.IF, conditions, ifTrue, elseClause);
    }
    parseForLoop() : ForNode{
        this.MatchAndMove(Tokens.FOR);
        this.MatchAndMove(Tokens.OPEN_PARENTHESIS);
        const declaredVars = this.parseStatement();
        this.MatchAndMove(Tokens.SEMICOLON);
        const condition = this.parseExpression();
        this.MatchAndMove(Tokens.SEMICOLON);
        const varActions = this.parseExpression();
        this.MatchAndMove(Tokens.CLOSE_PARENTHESIS);
        this.MatchAndMove(Tokens.DO);
        const loopBody = this.parseCommandList(Tokens.FOR, [Tokens.DONE]);
        this.MatchAndMove(Tokens.DONE);
        return new ForNode(0,Tokens.FOR, "", Tokens.FOR,declaredVars, condition, varActions, loopBody);
    }
    parseWhileLoop() : WhileNode{
        this.MatchAndMove(Tokens.WHILE);
        const condition = this.parseExpression();
        this.MatchAndMove(Tokens.DO);
        const loopBody = this.parseCommandList(Tokens.WHILE, [Tokens.DONE]);
        this.MatchAndMove(Tokens.DONE);
        return new WhileNode(0,Tokens.WHILE, "",Tokens.WHILE, condition, loopBody);

    }
    parseCaseStatement() : CaseNode{
        this.MatchAndMove(Tokens.CASE);
        let testedExpression = this.parseExpression();
        this.MatchAndMove(Tokens.IN);
        let arms : CaseArmNode[] = [];
        let peeked = this.getSpecificToken(0,false);
        while(peeked?.TokenType !== Tokens.EOF && peeked?.TokenType !== Tokens.ENDCASE){
            let patterns : string[] = [];
            do{
                if(patterns.length > 0){
                    this.MatchAndMove(Tokens.PIPE);
                }
                let currentToken = this.getSpecificToken(0,false);
                if(currentToken!.TokenType === Tokens.WORD || currentToken!.TokenType === Tokens.STRING
                    || currentToken!.TokenType === Tokens.VARIABLE
                ){
                    patterns.push(currentToken!.TokenValue);
                    this.getSpecificToken(1,true);
                }
                else{
                    throw new Error("unexpected pattern");
                }
                peeked = this.getSpecificToken(0,false);
            } while(peeked?.TokenType === Tokens.PIPE);
            this.MatchAndMove(Tokens.CLOSE_PARENTHESIS);
            let body = this.parseCommandList(Tokens.CLOSE_PARENTHESIS, [Tokens.DOUBLE_SEMICOLON]);
            this.MatchAndMove(Tokens.DOUBLE_SEMICOLON);
            let newArm = new CaseArmNode(0,Tokens.CASE,"",patterns,body, null);
            if(arms.length > 0){
                arms[arms.length - 1].next = newArm;
            }
            arms.push(newArm);
            peeked = this.getSpecificToken(0,false);
        }
        this.MatchAndMove(Tokens.ENDCASE);
        return new CaseNode(0, Tokens.CASE, "", testedExpression!, (arms.length > 0) ? arms : null);
    }
    parsePipeline() : PipelineNode{
        let validPipes = [Tokens.PIPE, Tokens.PIPE_AND]
        let isNegated;
        if(this.getSpecificToken(0,false)?.TokenType === Tokens.NOT){
            isNegated = true;
            this.getSpecificToken(1,true);
        }
        let seperatedCommands : Statement[] = [];
        seperatedCommands.push(this.parseSimpleCommand()!);
        let currentToken = this.getSpecificToken(0);
        while( currentToken && validPipes.includes(currentToken?.TokenType)){
            this.getSpecificToken(1,true);
            seperatedCommands.push(this.parseSimpleCommand()!);
            currentToken = this.getSpecificToken(0);
        }
        const commandList = new CommandListNode(0, Tokens.PIPE_AND, "", seperatedCommands);
        return new PipelineNode(0,Tokens.PIPE_AND, "", commandList);
    }
    parseArgs() : ArgumentNode{
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
        let currentToken = this.getSpecificToken(0,false);
        while(currentToken && tokensAndFuncs.has(currentToken!.TokenType)
        ){
            const parserFunc = tokensAndFuncs.get(currentToken.TokenType)!;
            args.push(parserFunc());
            currentToken = this.getSpecificToken(0, false);
        }
        return new ArgumentNode(0, Tokens.ARGUMENT_RECOGNISER, "", args);
    }
    parseRedirections() : RedirectionsNode{
        let validRedirects = [Tokens.REDIRECT_ALL, Tokens.REDIRECT_ALL_APPEND,
            Tokens.REDIRECT_APPEND, Tokens.REDIRECT_ERR, Tokens.REDIRECT_ERR_APPEND,
            Tokens.REDIRECT_IN, Tokens.REDIRECT_OUT
        ]
        const leftSide = this.parseExpression();
        const action = this.getSpecificToken(0,false)?.TokenType;
        if(action === undefined || !(validRedirects.includes(action))){
            throw new Error("invalid redirector");
        }
        this.getSpecificToken(1,true);
        const rightSide = this.parseExpression();
        return new RedirectionsNode(0,action, "", leftSide!, action, rightSide!);
    }
    parseVars() : VariableBracedNode | VariableNode{
        let validContinuations = [Tokens.EQUALS, Tokens.ERROR_FALLBACK,Tokens.ASSIGN_FALLBACK,
            Tokens.DEFAULT_FALLBACK,Tokens.ALTERNATE_FALLBACK,Tokens.OR];
        let variableType = this.getSpecificToken(0);
        this.getSpecificToken(1,true); 
        const varName = this.getSpecificToken(0);
        
        if(variableType && variableType.TokenType === Tokens.VARIABLE){
            this.getSpecificToken(1,true); 
            return new VariableNode(0, Tokens.VARIABLE, "", varName!.TokenValue, variableType!.TokenType,null);
        }
        
        let expression = null; 
        this.getSpecificToken(1,true); 
        let operator = this.getSpecificToken(0); 
        
        if(operator && validContinuations.includes(operator.TokenType)){
            this.getSpecificToken(1,true); 
            expression = this.parseExpression(); 
        }
        this.MatchAndMove(Tokens.CLOSE_BRACE); 
        
        let fallbackType = (operator && validContinuations.includes(operator.TokenType)) ? operator.TokenType : Tokens.VARIABLE_BRACED;
        return new VariableBracedNode(0,Tokens.VARIABLE_BRACED, "", varName!.TokenValue, fallbackType, expression!)
    }
    parseUntilLoop() : UntilNode{
        this.getSpecificToken(1,true); //consume the until token
        let condition = this.parseExpression();
        this.MatchAndMove(Tokens.SEMICOLON);
        this.MatchAndMove(Tokens.DO);
        let codeBlock = this.parseCommandList(Tokens.UNTIL, [Tokens.DONE]);
        this.MatchAndMove(Tokens.DONE);
        return new UntilNode(0,Tokens.UNTIL,"", condition, codeBlock);
    }
    parseArithmectic() : ArithmeticNode{
        this.MatchAndMove(Tokens.ARITHMETIC);
        const innerExpressions = this.parseExpression();
        this.MatchAndMove(Tokens.END_ARITHMETIC);
        return new ArithmeticNode(0,Tokens.ARITHMETIC, "", innerExpressions!);
    }
    parseAssignment() : AssignmentNode{
        let validOperators = [Tokens.PLUS_PLUS, Tokens.PLUS_EQUALS, Tokens.MINUS_EQUALS, 
            Tokens.ASTRIX_EQUALS, Tokens.SLASH_EQUALS, Tokens.EQUALS, Tokens.ASSIGNMENT
        ];

        const varName = this.getSpecificToken(0,false);
        this.getSpecificToken(1,true);
        const assignmentType = this.getSpecificToken(0,false);
        if(!(validOperators.includes(assignmentType!.TokenType))){
            throw new Error("unexpected assignment type");
        }
        this.getSpecificToken(1,true);
        const rightSide = this.parseExpression();
        return new AssignmentNode(0, assignmentType!.TokenType, "", varName!.TokenValue, assignmentType!.TokenType, rightSide!); 
    }
    parseCommandList(startToken : Tokens ,stopTokens : Tokens[]) : CommandListNode{
        let codeBlock : Statement[]  = [];
        let currentToken = this.getSpecificToken(0)?.TokenType;
        while(true){
            currentToken = this.getSpecificToken(0)?.TokenType;
            if(!currentToken || currentToken === Tokens.EOF || stopTokens.includes(currentToken)){
                break;
            }
            let currentStatement = this.parseStatement();
            if(currentStatement !== null){
                codeBlock.push(currentStatement);
            }
            else{
                this.getSpecificToken(1,true);
            }
        }
        return new CommandListNode(0,startToken,"",codeBlock);
    }
    parseCommandSub() : CommandSubNode{
        let stopTokens = new Map<string, Tokens>([
            ["`", Tokens.COMMAND_SUB_BACKTICK],
            ["(", Tokens.CLOSE_PARENTHESIS],
            ["$(", Tokens.CLOSE_PARENTHESIS]
        ]);
        const subshellType  = this.getSpecificToken(0,false);
        let stopToken;
        stopToken = stopTokens.get(subshellType!.TokenValue);
        this.getSpecificToken(1,true); //consume the ``, or () or $()
        const innerCommands = this.parseCommandList(subshellType!.TokenType, [stopToken!]);
        this.MatchAndMove(stopToken!);
        return new CommandSubNode(0, subshellType!.TokenType, "", innerCommands);
    }
    parseFunctionDeclaration() : FunctionNode{
        this.MatchAndMove(Tokens.FUNCTION);
        let funcName : string | null = this.getSpecificToken(0,false)?.TokenValue ?? null;
        this.MatchAndMove(Tokens.OPEN_PARENTHESIS);
        let funcParams = this.parseCommandList(Tokens.OPEN_PARENTHESIS, [Tokens.CLOSE_PARENTHESIS])
        this.MatchAndMove(Tokens.CLOSE_PARENTHESIS);
        this.MatchAndMove(Tokens.OPEN_BRACE);
        let funcBody = this.parseCommandList(Tokens.OPEN_BRACE,[Tokens.CLOSE_BRACE]);
        this.MatchAndMove(Tokens.CLOSE_BRACE);
        return new FunctionNode(0, Tokens.FUNCTION, "", funcName, funcParams, funcBody);
    }
    parseHereDoc() : HereDocNode{
        let command = this.parseStatement();
        let redirector = this.advance();
        if(redirector && this.IsRedirector(redirector)){
            throw new Error("Wrong redirector");
        }
        let delimeter = this.getSpecificToken(1,true)?.TokenValue;
        let content : string = this.MatchAndMove(Tokens.HEREDOC).TokenValue;
        return new HereDocNode(0, Tokens.HEREDOC, "", content, delimeter!, command!);
    }
    parseLogicalExpression() : LogicalExpressionNode{
        const leftSide = this.parseExpression();
        const operator = this.getSpecificToken(1,true);
        const right = this.parseExpression();
        return new LogicalExpressionNode(0, operator!.TokenType,"",leftSide!, right!, operator!.TokenType);
    }
    parseProgram() : ProgramNode{
        let commands = this.parseCommandList(Tokens.PROGRAM_TOKEN!, [Tokens.EOF]);
        return new ProgramNode(0, Tokens.EOF, "", commands);
    }
    parseSimpleCommand() : SimpleCommandNode{
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
        let currentToken = this.getSpecificToken(0);
        while(currentToken && !commandTerminators.includes(currentToken.TokenType)){
            let startPosition = this._position;
            let peekedNext = this.getSpecificToken(1);
            if(this.IsRedirector(currentToken.TokenType)){
                redirectors.push(this.parseRedirections());
                currentToken = this.getSpecificToken(0);
                continue;
            }
            if(!variableName &&peekedNext && peekedNext.TokenType === Tokens.ASSIGNMENT){
                assignments.push(this.parseAssignment());
                currentToken = this.getSpecificToken(0);
                continue;
            }
            if(!variableName){
                variableName = this.parseExpression();
                currentToken = this.getSpecificToken(0);
                continue;
            }
            args.push(this.parseArgs()!);
            currentToken = this.getSpecificToken(0);
            if(startPosition === this._position){
                throw new Error("unexpected token while parsing args");
            }
        }
        return new SimpleCommandNode(0, Tokens.COMMAND_SUB, "", variableName, args, redirectors,assignments)
    }
    parseString() : StringNode{
        const stringToken = this.MatchAndMove(Tokens.STRING);
        return new StringNode(stringToken.TokenValue, 0, Tokens.STRING, "");
    }
    parseSubshell() : SubshellNode{
        this.MatchAndMove(Tokens.OPEN_PARENTHESIS);
        let subshellStatements = this.parseCommandList(Tokens.OPEN_PARENTHESIS, [Tokens.CLOSE_PARENTHESIS]);
        this.MatchAndMove(Tokens.CLOSE_PARENTHESIS);
        return new SubshellNode(0,Tokens.OPEN_PARENTHESIS, "", subshellStatements);
    }
    parseWord() : WordNode{
        const rawWord = this.getSpecificToken(0);
        if(!rawWord){
            throw new Error("caught an undefined value while parsing a word token");
        }
        this.getSpecificToken(1,true);
        return new WordNode(rawWord.TokenValue, 0, Tokens.WORD, "");
    }
    IsRedirector(Token : Tokens) : boolean{
        let redirectionTypes = [Tokens.REDIRECT_ALL, Tokens.REDIRECT_ALL_APPEND,
            Tokens.REDIRECT_APPEND, Tokens.REDIRECT_ERR, Tokens.REDIRECT_ERR_APPEND,
            Tokens.REDIRECT_IN, Tokens.REDIRECT_OUT
        ];
        return redirectionTypes.includes(Token);
    }
}