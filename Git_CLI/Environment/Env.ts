import { VariableNode } from "../Parser/Nodes/VariableNode";
interface ShellVariable{
    value: string,
    isExported? : boolean,
    isReadonly? : boolean,
    isLocal? : boolean
};
export class Environment {
    
    // A private Map to hold variable names and their string values
    private variables: Map<string, string> = new Map();
    // A method for the Expander to ask: "What does this variable equal?"
    public getVariable(name: string): string | undefined {
        return this.variables.get(name);
    }
    // A method to save new variables (like when a user types: X=10)
    public setVariable(name: string, value: string, attributes? : Partial<ShellVariable>): void {
        this.variables.set(name, value);
    }
}