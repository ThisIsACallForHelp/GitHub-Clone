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
        let assigmentToken = assignmentNode.expression.Token;
        let expandedValue = this.expander.ExpandArgs([assignmentNode.expression]);
        this.environment.setVariable(varName, expandedValue[0]!.ErrorVal);
        return 0;
    }     
    public visitLogicalExpression(node: LogicalExpressionNode){
        let leftEvaluationCode = this.evaluate(node.left);
        let rightEvaluationCode = this.evaluate(node.right);
        if(node.operator === Tokens.AND){
            if(leftEvaluationCode !== 0){
                return false;
            }
            return leftEvaluationCode && rightEvaluationCode === 0;
        }
        if(node.operator === Tokens.OR){
            if(leftEvaluationCode === 0){
                return true;
            }
            return node.left || node.right;
        }
    }  
    private visitSimpleCommandNode(node: SimpleCommandNode, captureOutput : boolean) 
    {
        let stdioMode =  (captureOutput) ? 'pipe' : 'inherit';
        let processArgs : string[] = [];
        node.args.forEach(Arg => {
            processArgs.push(...Arg.parts.map(parts => parts.ErrorVal))
        })
        //why the fuck would you pass objects instead of string cuh 
        return spawnSync(node.commandName!.ErrorVal,processArgs,{stdio: stdioMode});
    }
    private visitPipelineNode(node: PipelineNode) 
    { 
        let temp = undefined;
        for(const command of node.commands.commands)
        {
            if(command instanceof SimpleCommandNode)
            {
                const simple = command as SimpleCommandNode;
                const res : any= spawnSync(simple.args, simple.args.map(arg => arg.parts), {input: temp});
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