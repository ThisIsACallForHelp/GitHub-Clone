import { Expression } from "./Expression";

export class ArgumentNode extends Expression{
	public Raw: string = "";
	public Parts: Expression[] = [];
	public Expanded: string | null = null;

	public constructor(Line: number = 0, Token: number = 0, Problem: string = "", raw?: string){
		super(Line, Token, Problem);
		if(raw) this.Raw = raw;
	}

	public addPart(part: Expression){
		this.Parts.push(part);
	}

	// Expand this argument using an expander helper and environment.
	// `expander` is optional and may implement `expandArgument(arg, env)`.
	public expand(expander?: any, env?: any): string{
		if(this.Expanded !== null) return this.Expanded;

		if(this.Parts.length === 0){
			this.Expanded = this.Raw;
			return this.Expanded;
		}

		if(expander && typeof expander.expandArgument === "function"){
			this.Expanded = expander.expandArgument(this, env);
			return this.Expanded;
		}

		// Fallback: stringify parts by calling toString() where available
		this.Expanded = this.Parts.map(p => (p as any).toString ? (p as any).toString() : "").join("");
		return this.Expanded;
	}

	public toString(): string{
		if(this.Expanded !== null) return this.Expanded;
		if(this.Raw) return this.Raw;
		return this.Parts.map(p => (p as any).toString ? (p as any).toString() : "").join("");
	}

}