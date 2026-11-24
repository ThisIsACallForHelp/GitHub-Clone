import { contextBridge, ipcRenderer } from 'electron';

export interface TerminalAPI {
  executeCommand: (code: string) => Promise<{ success: boolean; output?: string; error?: string }>;
  getSystemInfo: () => Promise<{ username: string; hostname: string; cwd: string }>;
}

const api: TerminalAPI = {
  executeCommand: (code: string) => ipcRenderer.invoke('execute-command', code),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
};

contextBridge.exposeInMainWorld('terminalAPI', api);
