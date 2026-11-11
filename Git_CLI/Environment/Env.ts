
interface ShellVariable{
    value: string,
    isExported : boolean,
    isReadonly : boolean,
    isLocal : boolean
};
export class Environment {
    public scopeFrame : Map<string, ShellVariable>;
    public scopeStack : Array<Map<string,ShellVariable>>;
    public constructor(){
        this.scopeFrame = new Map();
        this.scopeStack = new Array(this.scopeFrame);

        for(let [key, value] of Object.entries(process.env)){
            if(value !== undefined){
                this.scopeFrame.set(key, {value, isExported: true, isLocal: false, isReadonly: false})
            }
        }
        this.scopeFrame.set("$$", {value: process.pid.toString(), isExported: true, isLocal: false, isReadonly: false});
        this.scopeFrame.set("0", {value: "Git_Cli", isExported: false, isLocal: false, isReadonly: false});
    }
    public getVariable(name: string): ShellVariable | undefined {
        for(let i = this.scopeStack.length - 1; i>=0; i--){
            if(this.scopeStack[i]!.has(name)){
                return this.scopeStack[i]!.get(name);
            }
        }
        return undefined;
    }
    public setVariable(name: string, value: string, attributes? : Partial<ShellVariable>): void {
        const existingVar = this.getVariable(name);
        const newVar: ShellVariable = {
            isExported: attributes?.isExported ?? existingVar?.isExported ?? false,
            isLocal: attributes?.isLocal ?? existingVar?.isLocal ?? false,
            isReadonly: attributes?.isReadonly ?? existingVar?.isReadonly ?? false,
            value
        }
        if(existingVar?.isReadonly){
            throw new Error("cannot assign a new value to a read-only variable");
        }
        else if(attributes?.isLocal){
            this.scopeStack[this.scopeStack.length - 1]!.set(name, newVar);
            return;
        }
        for(let i = this.scopeStack.length - 1; i>=0; i--){
            if(this.scopeStack[i]!.has(name)){
                this.scopeStack[i]!.set(name,newVar);
                return;
            }
        }
        this.scopeStack[0]!.set(name,newVar);
    }
    public setPositional(args : string[]) : void{
        let topFrame = this.scopeStack[this.scopeStack.length - 1];
        for(let i =0; i < args.length; i++){
            topFrame!.set(`${i+1}`, {value: args[i]!, isExported: false, isReadonly: false, isLocal: true})
        }
        topFrame!.set("#", {value: args.length.toString(), isExported: false, isReadonly: false, isLocal:true});
        topFrame!.set("@", { value: args.join(" "), isExported: false, isReadonly: false, isLocal: true });
    }
    public unsetVariable(name: string) : void{
        for(let i = this.scopeStack.length - 1; i>=0; i--){
            if(this.scopeStack[i]!.has(name)){
                this.scopeStack[i]!.delete(name);
                return;
            }
        }
    }
    public pushScope() : void{
        this.scopeStack.push(new Map<string, ShellVariable>);
    }
    public popScope() : void{
        this.scopeStack.pop();
    }
    public getExported() : Record<string,string>{
        const exportRecorder : Record<string,string> = {};
        for(let i = this.scopeStack.length - 1; i>=0; i--){
            for (let [key, variable] of this.scopeStack[i]!) {
                if (variable.isExported && !(key in exportRecorder)) {
                    exportRecorder[key] = variable.value;
                }
            }
        }
        return exportRecorder;
    }
    public exportVar(varName : string) : void{
        let existingVar = this.getVariable(varName);
        if(existingVar){
            existingVar.isExported = true;
        }
    }
    public setReadonly(varName : string) : void{
        let existingVar = this.getVariable(varName);
        if(existingVar){
            existingVar.isReadonly = true;
        }
    }
    public setExitCode(code: number) : void{
        this.scopeStack[0]!.set("?", {isExported: false, isReadonly: false, isLocal: false, value: code.toString()})
    }
}