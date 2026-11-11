import {ASTNode} from '../Parser/Nodes/ASTNode.ts';
import {SimpleCommandNode} from '../Parser/Nodes/SimpleCommandNode.ts';
import {PipelineNode} from '../Parser/Nodes/PipelineNode.ts'
import { spawnSync } from 'node:child_process';
import { IfNode } from '../Parser/Nodes/IfNode.ts';
import { CommandListNode } from '../Parser/Nodes/CommandListNode.ts';
import { exit } from 'node:process';
import type { ProgramNode } from '../Parser/Nodes/ProgramNode.ts';
import { AssignmentNode } from '../Parser/Nodes/AssignmentNode.ts';
import { Tokens } from '../Lexer/LexerTokens.ts';
import type { Expander } from '../Expander/Expander.ts';
import type { Environment } from '../Environment/Env.ts';
import type { LogicalExpressionNode } from '../Parser/Nodes/LogicalExpressionNode.ts';
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
        let assigmentToken = assignmentNode.expression.astToken.TokenType;
        let expandedValue = this.expander.ExpandArgs([assignmentNode.expression]);
        this.environment.setVariable(varName, expandedValue[0]!);
        return 0;
    }     
    public visitLogicalExpression(node: LogicalExpressionNode){
        const leftEvaluationCode = this.evaluate(node.left);
        if(leftEvaluationCode !== 0 && node.operator === Tokens.AND) { return false;}
        if(leftEvaluationCode === 0 && node.operator === Tokens.OR) { return leftEvaluationCode as number;}
        const rightEvaluationCode = this.evaluate(node.right);
        return rightEvaluationCode as number
    }  
    private visitSimpleCommandNode(node: SimpleCommandNode, captureOutput : boolean) 
    {
        const stdioMode =  (captureOutput) ? 'pipe' : 'inherit';
        let processArgs : string[] = node.args.flatMap(arg => this.expander.ExpandArgs(arg.parts));
        return spawnSync(node.commandName!.astToken.TokenValue,processArgs,{stdio: stdioMode});
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
        private visitIfNode(node: IfNode) 
    {
        const conditionResult = this.evaluate(node.condition);
        
        if (conditionResult === 0)
        {
            for (let cmd of node.thenBody.commands)
            {
                this.evaluate(cmd);
            }
        }
        else 
        {
            if (node.elseChain instanceof IfNode && node.elseChain !== null)
            {
                this.visitIfNode(node.elseChain);
            }
        }
        if(node.elseChain instanceof CommandListNode && node.elseChain !== null){
            for(let cmd of node.elseChain.commands){
                this.evaluate(cmd);
            }
        }
        return 0;
    }
    public evaluate(node: ASTNode, captureOutput: boolean = false)
    {
        if(node instanceof SimpleCommandNode)
        {
            let visitedNodeRespnse = this.visitSimpleCommandNode(node, captureOutput);
            if(captureOutput){
                return visitedNodeRespnse.stdout.toString();
            }
            return visitedNodeRespnse.status ?? 1;
        }
        else if (node instanceof PipelineNode) { return this.visitPipelineNode(node) ?? 1; }
        else if (node instanceof IfNode){
            return this.visitIfNode(node) ?? 1;
        }
        return 0;
    }
}