import {ASTNode} from '../Parser/Nodes/ASTNode.ts';
import {SimpleCommandNode} from '../Parser/Nodes/SimpleCommandNode.ts';
import {PipelineNode} from '../Parser/Nodes/PipelineNode.ts'
import { spawnSync } from 'node:child_process';
import { IfNode } from '../Parser/Nodes/IfNode.ts';
import { CommandListNode } from '../Parser/Nodes/CommandListNode.ts';
import * as fs from "node:fs"
import { ProgramNode } from '../Parser/Nodes/ProgramNode.ts';
import { AssignmentNode } from '../Parser/Nodes/AssignmentNode.ts';
import { Tokens } from '../Lexer/LexerTokens.ts';
import type { Expander } from '../Expander/Expander.ts';
import type { Environment } from '../Environment/Env.ts';
import  { LogicalExpressionNode } from '../Parser/Nodes/LogicalExpressionNode.ts';
import  { WhileNode } from '../Parser/Nodes/WhileNode.ts';
import  { ForNode } from '../Parser/Nodes/ForNode.ts';
import  { UntilNode } from '../Parser/Nodes/UntilNode.ts';
import  { CaseNode } from '../Parser/Nodes/CaseNode.ts';
import { SubshellNode } from '../Parser/Nodes/SubshellNode.ts';
import { CommandGroupNode } from '../Parser/Nodes/CommandGroupNode.ts';
import { FunctionNode } from '../Parser/Nodes/FunctionNode.ts';
import { HereDocNode } from '../Parser/Nodes/HereDocNode.ts';
import { RedirectionsNode } from '../Parser/Nodes/RedirectionsNode.ts';
import { exit } from 'node:process';
export class Evaluator
{
    constructor(private expander: Expander, private environment: Environment){ }
    public visitCommandNode(node: CommandListNode){
        let exitCode : number = 0;
        for(let command of node.commands){
            let res : number = this.evaluate(command) as number;
            this.environment.setExitCode(res);
            exitCode = res;
        }
        return exitCode;
    }
    public visitProgramNode(program: ProgramNode){
        return this.visitCommandNode(program.code);
    }
    public visitAssignmentNode(assignmentNode : AssignmentNode){
        let varName = assignmentNode.variableName;
        let expandedValue = this.expander.ExpandArgs([assignmentNode.expression]);
        this.environment.setVariable(varName, expandedValue[0]!);
        return 0;
    }     
    public visitLogicalExpression(node: LogicalExpressionNode){
        const leftEvaluationCode = this.evaluate(node.left);
        if(leftEvaluationCode !== 0 && node.operator === Tokens.AND) { return leftEvaluationCode as number;}
        if(leftEvaluationCode === 0 && node.operator === Tokens.OR) { return leftEvaluationCode as number;}
        const rightEvaluationCode = this.evaluate(node.right);
        return rightEvaluationCode as number
    }  
    private visitSimpleCommandNode(node: SimpleCommandNode, captureOutput : boolean) 
    {
        const commandName = node.commandName?.astToken.TokenValue;
        if(!commandName){ return 0; }
        let processArgs : string[] = node.args.flatMap(arg => this.expander.ExpandArgs(arg.parts));
        const func = this.environment.getFunction(node.commandName!.astToken.TokenValue);
        if(func){
            let exitCode = 0;
            try{
                this.environment.pushScope();
                this.environment.setPositional(processArgs);
                exitCode = this.evaluate(func);
            }
            finally{
                this.environment.popScope();
            }
            return { status: exitCode} as any;
        }
        let stdin: any = 'inherit';
        let stdout: any = captureOutput ? 'pipe' : 'inherit';
        let stderr: any = 'inherit';
        let pushedFiles = [];
        if(node.redirectors){
            for(let redir of node.redirectors){
                let [filename] = this.expander.ExpandArgs([redir.target]);
                if(redir.operator === Tokens.REDIRECT_OUT){
                    const fd = fs.openSync(filename!, 'w');
                    stdout = fd;
                    pushedFiles.push(fd);
                }
                else if(redir.operator === Tokens.REDIRECT_APPEND){
                    const fd = fs.openSync(filename!, 'a');
                    stdout = fd;
                    pushedFiles.push(fd);
                }
                else if(redir.operator === Tokens.REDIRECT_IN){
                    const fd = fs.openSync(filename!, 'r');
                    stdin = fd;
                    pushedFiles.push(fd);
                }
            }
        }
        try{
            return spawnSync(node.commandName!.astToken.TokenValue,processArgs,{stdio: [stdin, stdout, stderr]});
        }
        finally{
            for(let f of pushedFiles){
                fs.closeSync(f);
            }
        }
    }
    private visitPipelineNode(node: PipelineNode) 
    { 
        let temp = undefined;
        for(const command of node.commands.commands)
        {
            if(command instanceof SimpleCommandNode)
            {
                const simple = command as SimpleCommandNode;
                const argStrings: string[] = simple.args.flatMap(arg => this.expander.ExpandArgs(arg.parts));
                const res : any= spawnSync(simple.commandName!.astToken.TokenValue, argStrings, {input: temp});
                temp = res.stdout;
            }
        }
        if(temp !== undefined)
        {
            console.log(temp.toString());
            return 0;
        }
        return -1;
    }
    private visitIfNode(node: IfNode) : number
    {
        const conditionResult = this.evaluate(node.condition);
        
        if (conditionResult === 0)
        {
            return this.evaluate(node.thenBody) as number;
        }
        else if(node.elseChain instanceof IfNode){
            return this.visitIfNode(node.elseChain);
        }
        else if (node.elseChain instanceof CommandListNode){
            return this.evaluate(node.elseChain) as number;
        }
        return 0;
    }

    private visitWhileNode(node: WhileNode){
        let lastExitCode = 0;
        while(this.evaluate(node.condition!) === 0){
            lastExitCode = this.evaluate(node.loopBody!) as number;
        }
        return lastExitCode;
    }

    private visitForNode(node: ForNode){
        let lastExitCode = 0;
        if(node.initVars){
            this.evaluate(node.initVars!)
        }
        while(node.condition ? this.evaluate(node.condition!) === 0 : true){
            lastExitCode = this.evaluate(node.loopBody!) as number;
            if(node.manipVars){
                this.evaluate(node.manipVars!);
            }
        }
        return lastExitCode;
    }

    private visitUntilNode(node: UntilNode){
        let lastExitCode = 0;
        while(this.evaluate(node.condition!) !== 0){
            lastExitCode = this.evaluate(node.loopBody!) as number;
        }
        return lastExitCode;
    }

    private visitCaseNode(node: CaseNode){
        if(!node.node) { return 0;}
        const [targetValue] = this.expander.ExpandArgs([node.testedExpression]);
        for(const arm of node.node!){
            for(const pattern of arm.patterns){
                if(pattern === "*" || pattern === targetValue){
                    return this.evaluate(arm.body) as number;
                }
            }
        }
        return 0;
    }

    private visitSubshellNode(node: SubshellNode){
        let exitCode = 0;
        try{
            this.environment.pushScope();
            exitCode = this.evaluate(node.shellCommands) as number;
        }
        finally{
            this.environment.popScope();
        }
        return exitCode;
    }

    private visitCommandGroupNode(node: CommandGroupNode){
        return this.evaluate(node.commands) as number;
    }

    private visitFunctionNode(node: FunctionNode){
        if(node.funcName){
            this.environment.pushFunction(node.funcName!, node.funcBody!);
        }
        return 0;
            
    }

    private visitHereDocNode(node: HereDocNode){
        if(node.command instanceof SimpleCommandNode){
            const args = node.command.args.flatMap(arg => this.expander.ExpandArgs(arg.parts));
            const res = spawnSync(node.command.commandName!.astToken.TokenValue, args,
                                {
                                    input: node.hereDocContent,
                                    stdio: ['pipe', 'inherit', 'inherit']
                                });
            return res.status ?? 0;
        }
        return 0;
    }

    public evaluate(node: ASTNode, captureOutput: boolean = false) : any
    {
        if(node instanceof SimpleCommandNode)
        {
            let visitedNodeRespnse = this.visitSimpleCommandNode(node, captureOutput);
            if(captureOutput){
                return visitedNodeRespnse.stdout?.toString() ?? "";
            }
            return visitedNodeRespnse.status ?? 1;
        }
        else if (node instanceof PipelineNode) { return this.visitPipelineNode(node) ?? 1; }
        else if (node instanceof IfNode){  return this.visitIfNode(node) ?? 1; }
        else if(node instanceof ProgramNode){ return this.visitProgramNode(node) ?? 1;}
        else if(node instanceof HereDocNode) { return this.visitHereDocNode(node) ?? 1;}
        else if(node instanceof FunctionNode) { return this.visitFunctionNode(node) ?? 1;}
        else if(node instanceof AssignmentNode) { return this.visitAssignmentNode(node) ?? 1;}
        else if(node instanceof SubshellNode) { return this.visitSubshellNode(node) ?? 1;}
        else if(node instanceof CommandGroupNode)  { return this.visitCommandGroupNode(node) ?? 1;}
        else if(node instanceof CommandListNode) { return this.visitCommandNode(node) ?? 1;}
        else if(node instanceof WhileNode) { return this.visitWhileNode(node) ?? 1;}
        else if(node instanceof ForNode) { return this.visitForNode(node) ?? 1;}
        else if(node instanceof UntilNode) { return this.visitUntilNode(node) ?? 1;}
        else if(node instanceof CaseNode) { return this.visitCaseNode(node) ?? 1;}
        else if(node instanceof LogicalExpressionNode) { return this.visitLogicalExpression(node) as number ?? 1;}
        return 0;
    }
}