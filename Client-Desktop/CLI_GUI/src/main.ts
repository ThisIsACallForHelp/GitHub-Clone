import { app, BrowserWindow, ipcMain } from 'electron';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import os from 'node:os';
import {Lexer} from '../../../Git_CLI/Lexer/Lexer.ts'
import {Parser} from '../../../Git_CLI/Parser/Parser.ts'
import {Environment} from '../../../Git_CLI/Environment/Env.ts'
import {Evaluator} from '../../../Git_CLI/Evaluator/Eval.ts'
import {Expander} from '../../../Git_CLI/Expander/Expander.ts'
import { Tokens } from '../../../Git_CLI/Lexer/LexerTokens.ts';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const env = new Environment();
const exp = new Expander(env, null as any);
const evaluator = new Evaluator(exp, env);
(exp as any).evaluator = evaluator;


function createWindow(): void {
  const window = new BrowserWindow({
    width: 950,
    height: 650,
    backgroundColor: '#0d1117',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      sandbox: false
    },
  });

  window.loadFile(path.join(__dirname, '../src/index.html'));
}

ipcMain.handle('get-system-info', async () => {
  try {
    return {
      username: os.userInfo().username || 'user',
      hostname: os.hostname() || 'git-shell',
      cwd: path.basename(process.cwd()) || '~',
    };
  } catch {
    return { 
      username: 'user',
      hostname: 'git-shell',
      cwd: '~' 
    };
  }
})

ipcMain.handle('execute-command', async (_event, code : string) => {
  try{
    const lexer : Lexer = new Lexer(code);
    const tokens = [];
    let token = lexer.GetNextToken();
    while(token && token.TokenType != Tokens.EOF){
      tokens.push(token);
      token = lexer.GetNextToken();
    }
    tokens.push(token);
    const parser = new Parser(tokens);
    const program = parser.parseProgram();
    const result = evaluator.evaluate(program, true);
    const outputText = result !== undefined && result !== null ? String(result) : '';
    return { success: true, output: outputText };
  }
  catch(err : any){
    return { success: false, error: err?.message ?? String(err) };
  }
})

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
