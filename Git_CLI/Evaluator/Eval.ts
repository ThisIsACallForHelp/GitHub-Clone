import {ASTNode} from '../Parser/Nodes/ASTNode.ts';
import {SimpleCommandNode} from '../Parser/Nodes/SimpleCommandNode.ts';
import {PipelineNode} from '../Parser/Nodes/PipelineNode.ts'
import {spawnSync} from 'child_process';
import { IfNode } from '../Parser/Nodes/IfNode.ts';
export class Evaluator
{
    private visitSimpleCommandNode(node: SimpleCommandNode) 
    {
        return spawnSync(node.command,node.args.map(arg => arg.raw),{stdio:'inherit'}).status;
    }
    private visitPipelineNode(node: PipelineNode) 
    { 
        let temp = undefined;
        for(const command of node.commands.commands)
        {
            if(command instanceof SimpleCommandNode)
            {
                const simple = command as SimpleCommandNode;
                const res : any= spawnSync(simple.command, simple.args.map(arg => arg.raw), {input: temp});
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
            if (node.elseChain !== null)
            {
                this.visitIfNode(node.elseChain);
            }
        }
        
        return 0;
    }
    public evaluate(node: ASTNode)
    {
        if(node instanceof SimpleCommandNode)
        {
            return this.visitSimpleCommandNode(node); 
        }
        else if (node instanceof PipelineNode) { return this.visitPipelineNode(node); }
        else if (node instanceof IfNode){
            return this.visitIfNode(node);
        }
    }
}