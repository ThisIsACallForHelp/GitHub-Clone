import {ASTNode} from '../Parser/Nodes/ASTNode.ts';
import {SimpleCommandNode} from '../Parser/Nodes/SimpleCommandNode.ts';
import {spawnSync} from 'child_process';
export class Evaluator
{
    private visitSimpleCommandNode(node: SimpleCommandNode) 
    {
        return spawnSync(node.commandName,node.args,{stdio:'inherit'}).status;
    }
    public evaluate(node: ASTNode)
    {
        if(node instanceof SimpleCommandNode)
        {
            return this.visitSimpleCommandNode(node); 
        }
    }
}