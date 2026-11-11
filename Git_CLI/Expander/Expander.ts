import { Tokens } from '../Lexer/LexerTokens.ts';
const DEFAULT_HOME_PATH : string = "/home/user";
import { Environment } from '../Environment/Env.ts';
import { VariableBracedNode } from '../Parser/Nodes/VariableBracedNode.ts';
import { VariableNode } from '../Parser/Nodes/VariableNode.ts';
import { Expression } from '../Parser/Nodes/Expression.ts';
import { ArithmeticNode } from '../Parser/Nodes/ArithmeticNode.ts';
import * as fs from "node:fs"
import { WordNode } from '../Parser/Nodes/WordNode.ts';
import { Evaluator } from '../Evaluator/Eval.ts';
import { CommandSubNode } from '../Parser/Nodes/CommandSubNode.ts';
import { TokenModel } from '../Lexer/TokenModel.ts';

export class Expander
{
    constructor(private env: Environment, private evaluator: Evaluator){ }
    public IsDigit(char: string) : boolean{
        return char>='0'&&char<='9';
        
    }
    public IsChar(char: string) : boolean{
        return (char>='a' && char<= 'z') || (char>='A' && char<='Z');
    }
    public GlobToRegex(pattern: string) : RegExp{
        let regexStr = "";
        for(let char of pattern){
            if(char === '*'){ regexStr += ".*"; }
            else if(char === '?') { regexStr += ".";}
            else if(".+^${}()|[]\\".includes(char)) { regexStr += "\\" + char;}
            else { regexStr += char;}
        }
        return new RegExp("^" + regexStr + "$");
    }
    public CalcExpression(leftSide : number, operator : string, rightSide : number) : number{
        let result : number = 0;
        if(operator === '+') { result = leftSide + rightSide}
        else if(operator === '-') { result = leftSide - rightSide}
        else if(operator === '*') { result = leftSide * rightSide}
        else if(operator === '/') { result = leftSide / rightSide}
        else if(operator === '%') { result = leftSide % rightSide}
        return result;
    }
    public MathEvaluator(mathExpression : string) : number{
        let numberStack : number[] = [];
        let operatorStack : string[] = [];
        let validOpeators = ['-', '+', '*', '/', '%'];
        let operationOrder = [['+','-'], ['*','/'], ['%'], ['(', ')']];
        for(let i =0; i < mathExpression.length; i++){
            if(validOpeators.includes(mathExpression.charAt(i)) || mathExpression.charAt(i) === '('){
                let currentTop = operatorStack[operatorStack.length - 1] || undefined;
                let upcomingOperation = mathExpression.charAt(i);
                if(currentTop === undefined){
                    operatorStack.push(mathExpression.charAt(i));
                    continue;
                }
                while(operatorStack.length > 0){
                    let top = operatorStack[operatorStack.length - 1]!;
                    if(top === '('){
                        break;
                    }
                    let TopOperationIndex = operationOrder.findIndex(group => group.includes(top));
                    let upcomingOperationIndex = operationOrder.findIndex(group => group.includes(upcomingOperation));
                    if(TopOperationIndex < upcomingOperationIndex){
                        break;
                    }
                    operatorStack.pop();
                    let rightSide = numberStack.pop()!;
                    let leftSide = numberStack.pop()!;
                    let result = this.CalcExpression(leftSide, top, rightSide);
                    numberStack.push(result);
                }
                operatorStack.push(upcomingOperation);
            }
            else if(this.IsChar(mathExpression.charAt(i))){
                let varName : string = "";
                while(this.IsChar(mathExpression.charAt(i))){
                    varName += mathExpression.charAt(i);
                    i++;
                }
                i--;
                let expandedVar : number = +this.env.getVariable(varName)!.value || 0;
                numberStack.push(expandedVar);
            }
            else if(this.IsDigit(mathExpression.charAt(i))){
                let numberStr : number = 0;
                while(this.IsDigit(mathExpression.charAt(i))){
                    numberStr *= 10;
                    numberStr += +mathExpression.charAt(i);
                    i++;
                }
                i--;
                numberStack.push(numberStr);
            }
            else if(mathExpression.charAt(i) === ')'){
                let operator = '';
                let numberTop : number = 0;
                let secondNum : number = 0;
                while(operatorStack[operatorStack.length - 1] !== '('){
                    numberTop = numberStack.pop()!;
                    operator = operatorStack.pop()!;
                    secondNum = numberStack.pop()!;
                    let result = this.CalcExpression(secondNum, operator, numberTop);
                    numberStack.push(result);
                }
                operatorStack.pop();
            }
        }
        while(operatorStack.length !== 0){
            let rightSide = numberStack.pop()!;
            let operator = operatorStack.pop()!;
            let leftSide = numberStack.pop()!;
            let result = this.CalcExpression(leftSide, operator, rightSide);
            numberStack.push(result);
        }
        return numberStack.pop()!;
    }
    public ExpandArithmetic(parts : Expression[]){
        for(let i =0; i < parts.length;i++){
            const currToken = parts[i];
            if(currToken instanceof ArithmeticNode){
                let rawString = currToken.innerExp;
                let calculatedNum = this.MathEvaluator(rawString.astToken.TokenValue);
                let calculated = calculatedNum.toString();
                parts[i] = new Expression(new TokenModel(Tokens.NUMBER, calculated,
                     parts[i]?.astToken.StartingPosition, parts[i]?.astToken.tokenLine!));
            }
        }
        return parts;
    }
    public SplitWord(words : (string | Expression)[]){
        let splitTokenArray : (string | Expression)[] = []
        let IFSVar = this.env.getVariable("IFS");
        if (IFSVar && IFSVar.value === "") {
            return words;
        }
        let IFS = IFSVar?.value || " \t\n";
        let escapedIFS = IFS.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        for(let i = 0; i < words.length; i++){
            const currWord = words[i];
            if(currWord instanceof WordNode && currWord.astToken.TokenType === Tokens.EXPANDED_WORD){
                let rawString = currWord.raw;
                let splitStrings : string[] = rawString!.split(new RegExp(`[${escapedIFS}]`));
                for(let split of splitStrings){
                    if(split){
                        splitTokenArray.push(new WordNode(new TokenModel(Tokens.WORD, split,
                        currWord.astToken.StartingPosition ,currWord.astToken.tokenLine), ""));
                    }
                }
            } else {
                splitTokenArray.push(currWord!);
            }
        }
        return splitTokenArray;
    }
    public RemoveQuotes(words: string[]){
        let unquotedArray : string[] = [];
        for(let word of words){
            let inSingleQuotes = false, inDoubleQuotes = false, isPreviousSlash = false;
            let strippedWord : string = "";
            for(let char of word){
                if(isPreviousSlash){
                    strippedWord += char;
                    isPreviousSlash = !isPreviousSlash;
                    continue;
                }
                else if((char === "\'" && inDoubleQuotes) || (char === "\"" && inSingleQuotes)){
                    strippedWord += char;
                    continue;
                }
                else if(char === "\"" && !inSingleQuotes){
                    inDoubleQuotes = !inDoubleQuotes;
                    continue;
                }
                else if(char === "\'" && !inDoubleQuotes){
                    inSingleQuotes = !inSingleQuotes;
                    continue;
                }
                else if(char === "\\" && !inSingleQuotes){
                    isPreviousSlash = !isPreviousSlash;
                    continue;
                }
                else{
                    strippedWord += char;
                }
            }
            unquotedArray.push(strippedWord);
        }
        return unquotedArray;
    }
    public FileExpander(words : string[]){
        let expandedPaths : string[] = [];
        for(let word of words){
            if(!word.includes("*") && !word.includes("?")){
                expandedPaths.push(word);
                continue;
            }
            let regex = this.GlobToRegex(word);
            let files = fs.readdirSync(process.cwd());
            let matched : string[] = files.filter(file => regex.test(file)).sort();
            
            if (matched.length === 0) {
                expandedPaths.push(word);
            } else {
                expandedPaths.push(...matched);
            }
        }
        return expandedPaths;
    }
    public VariableExpander(parts : Expression[]){
        let expandedVars : Expression[] = [];
        for(let i =0; i < parts.length; i++){
            const currToken = parts[i];
            if(currToken instanceof VariableBracedNode ||
               currToken instanceof VariableNode
            ){
                let varName = currToken.name; 
                let variableValue = this.env.getVariable(varName)?.value || "";
                expandedVars.push(new WordNode(new TokenModel(Tokens.EXPANDED_WORD,variableValue,
                    currToken.astToken.StartingPosition,currToken.astToken.tokenLine), ""));
            }
            else{                                     
                expandedVars.push(currToken!);
            }
        } 
        return expandedVars;
    }
    public TildeExpander(parts : Expression[]){
        let firstNode = parts[0];
        if(!(firstNode instanceof WordNode)){
            return parts;
        }
        let rawString = firstNode.raw;
        if(!rawString.startsWith("~/") && rawString !== "~"){
            return parts;
        }
        let homePath = this.env.getVariable("HOME")?.value || DEFAULT_HOME_PATH;
        let expandedPath = rawString.replace("~", homePath) || homePath;
        parts[0] = new WordNode(new TokenModel(Tokens.EXPANDED_TILDE, expandedPath,
            parts[0]?.astToken.StartingPosition,parts[0]!.astToken.tokenLine), "");
        return parts;
    }
    public ExpandArgs(args : Expression[]){
        let expandedTilde = this.TildeExpander(args);
        let expandedVars = this.VariableExpander(expandedTilde);
        let expandedArithmetic = this.ExpandArithmetic(expandedVars);
        let expandedCommands = this.ExpandCommands(expandedArithmetic);
        let splitWords = this.SplitWord(expandedCommands);
        let rawStrings : string[] = [];
        splitWords.forEach(Word => {
            const rawWord = Word
           if(rawWord instanceof WordNode){
                rawStrings.push(rawWord.raw);
           } 
           else if(rawWord instanceof Expression){
                rawStrings.push(rawWord.astToken.TokenValue);
           } 
           else{
            rawStrings.push(Word.toString());
           }
        });
        let fileExpanded = this.FileExpander(rawStrings);
        let removedQuotes = this.RemoveQuotes(fileExpanded);
        return removedQuotes;
    }
    public ExpandCommands(parts : Expression[]){
        let expandedCommands : Expression[] = [];
        for(let part of parts){
            if(part instanceof CommandSubNode){
                let captureResponse = true;
                let evaluatedCommand = this.evaluator.evaluate(part.inner, captureResponse);
                let Trimmed = evaluatedCommand?.toString().split('\n').join(' ');
                expandedCommands.push(new WordNode(new TokenModel(Tokens.WORD,Trimmed!,
                    part.astToken.StartingPosition, part.astToken.tokenLine), ""));
            }
            else{
                expandedCommands.push(part);
            }
        }
        return expandedCommands;
    }
}