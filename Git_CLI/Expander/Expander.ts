import { Tokens } from '../Lexer/LexerTokens.ts';
import {TokenModel} from '../Lexer/TokenModel.ts'
//a temporary class
export class Environment {
    // A private Map to hold variable names and their string values
    private variables: Map<string, string> = new Map();
    // A method for the Expander to ask: "What does this variable equal?"
    public getVariable(name: string): string | undefined {
        return this.variables.get(name);
    }
    // A method to save new variables (like when a user types: X=10)
    public setVariable(name: string, value: string): void {
        this.variables.set(name, value);
    }
}

export class Expander
{
    constructor(private env: Environment){}
    public expand(tokens: TokenModel[])
    {
        let ExpandedTokens : TokenModel[] = [];
        for(let i = 0; i < tokens.length; i++)
        {
            const tokenVal = tokens[i].TokenValue;
            const openIndex = tokenVal.indexOf("{");
            const closingIndex = tokenVal.indexOf("}");
            
            if(openIndex == -1 || closingIndex == -1)
            {
                ExpandedTokens.push(tokens[i]);
                continue;
            }

            //maybe we will make it recursive later
            const prefix = tokenVal.substring(0,openIndex);
            const data : string[] = tokenVal.substring(openIndex + 1, closingIndex).split(',');
            const suffix = tokenVal.substring(closingIndex + 1);
            data.forEach(item => {
                const res = prefix+item+suffix;
                const newToken = new TokenModel(tokens[i].TokenType, res, tokens[i].StartingPosition);
                ExpandedTokens.push(newToken);
            })
        }
        return ExpandedTokens;
    }
}