import React, { useState, useRef, useEffect } from 'react';

interface TerminalEntry {
  id: string;
  command: string;
  result: string;
  isError?: boolean;
  promptLabel?: string;
}

const getInitialPrompt = () => {
  try {
    const api = (window as any).terminalAPI;
    if (api?.systemInfo?.username && api?.systemInfo?.hostname) {
      return `${api.systemInfo.username}@${api.systemInfo.hostname}:${api.systemInfo.cwd}$`;
    }
  } catch {}
  return 'user@git-shell:~$';
};

export default function App() {
  const [promptLabel, setPromptLabel] = useState<string>(getInitialPrompt);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [command, setCommand] = useState('');
  const [scriptText, setScriptText] = useState(`# Write multi-line scripts here...
# Example:
function greet() {
  echo "Hello from script editor!"
}
greet`);
  const [entries, setEntries] = useState<TerminalEntry[]>([]);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const scriptInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const api = (window as any).terminalAPI;
        if (api?.systemInfo?.username && api?.systemInfo?.hostname) {
          setPromptLabel(`${api.systemInfo.username}@${api.systemInfo.hostname}:${api.systemInfo.cwd}$`);
        } else if (api?.getSystemInfo) {
          const info = await api.getSystemInfo();
          if (info?.username && info?.hostname) {
            setPromptLabel(`${info.username}@${info.hostname}:${info.cwd}$`);
          }
        }
      } catch {
      }
    };
    fetchInfo();
  }, []);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  useEffect(() => {
    commandInputRef.current?.focus();
  }, []);
  useEffect(() => {
    if (isEditorOpen) {
      scriptInputRef.current?.focus();
    } else {
      commandInputRef.current?.focus();
    }
  }, [isEditorOpen]);

  const addEntry = (cmd: string, result: string, isError = false) => {
    setEntries((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, command: cmd, result, isError, promptLabel },
    ]);
  };

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = command.trim();
    if (!trimmed) return;

    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);
    setCommand('');

    if (trimmed === 'git expand') {
      setIsEditorOpen(true);
      addEntry(trimmed, '⚡ Multi-line script editor expanded.');
      return;
    }

    if (trimmed === 'git collapse') {
      setIsEditorOpen(false);
      addEntry(trimmed, 'Script editor collapsed.');
      return;
    }

    if (trimmed === 'clear') {
      setEntries([]);
      return;
    }

    try {
      if ((window as any).terminalAPI?.executeCommand) {
        const res = await (window as any).terminalAPI.executeCommand(trimmed);
        addEntry(trimmed, res.output ?? '', !res.success);
      } else {
        addEntry(trimmed, `[Executed: ${trimmed}]`);
      }
    } catch (err: any) {
      addEntry(trimmed, err?.message ?? String(err), true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setCommand(history[nextIndex] ?? '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (history.length === 0 || historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setCommand('');
      } else {
        setHistoryIndex(nextIndex);
        setCommand(history[nextIndex] ?? '');
      }
    }
  };

  const handleRunScript = async () => {
    const trimmed = scriptText.trim();
    if (!trimmed) return;

    try {
      if ((window as any).terminalAPI?.executeCommand) {
        const res = await (window as any).terminalAPI.executeCommand(trimmed);
        addEntry('[Script Runner]', res.output ?? '(Script completed successfully with exit code 0)', !res.success);
      } else {
        addEntry('[Script Runner]', `[Executed multi-line script (${trimmed.split('\n').length} lines)]`);
      }
    } catch (err: any) {
      addEntry('[Script Runner]', err?.message ?? String(err), true);
    }
  };

  const handleScriptKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleRunScript();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const target = e.currentTarget;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const updated = scriptText.substring(0, start) + '  ' + scriptText.substring(end);
      setScriptText(updated);
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="window-container">
      <header className="window-header">
        <div className="traffic-lights">
          <span className="light close" />
          <span className="light minimize" />
          <span className="light maximize" />
        </div>
        <div className="window-title">Git Shell Desktop • [CLI + IDE]</div>
        <div className="header-actions">
          <button
            id="toggle-editor-btn"
            onClick={() => setIsEditorOpen((prev) => !prev)}
            title="Toggle Script Editor (or type 'git expand')"
          >
            {isEditorOpen ? '✕ Close Editor' : '⚡ Script Editor'}
          </button>
        </div>
      </header>
      <section className={`editor-drawer ${isEditorOpen ? '' : 'collapsed'}`}>
        <div className="drawer-header">
          <div className="drawer-title">
            <span>📝 Multi-line Script Editor</span>
            <span className="shortcut-hint">(Press Ctrl + Enter to run)</span>
          </div>
          <div className="drawer-controls">
            <button className="primary-btn" onClick={handleRunScript}>
              ▶ Run Script
            </button>
            <button
              className="close-btn"
              onClick={() => setIsEditorOpen(false)}
              title="Close Editor"
            >
              ✕
            </button>
          </div>
        </div>
        <textarea
          ref={scriptInputRef}
          id="script-input"
          spellCheck={false}
          value={scriptText}
          onChange={(e) => setScriptText(e.target.value)}
          onKeyDown={handleScriptKeyDown}
        />
      </section>
      <main
        className="terminal-container"
        onClick={() => {
          if (window.getSelection()?.toString().length === 0) {
            commandInputRef.current?.focus();
          }
        }}
      >
        <div className="terminal-output">
          {/* Welcome Banner */}
          <div className="welcome-message">
            <pre className="banner">
{`  _____ _ _     ____  _          _ _ 
 / ____(_) |   / ___|| |        | | |
| |  __ _| |_  \\___ \\| |__   ___| | |
| | |_ | | __|  ___) | '_ \\ / _ \\ | |
| |__| | | |_  |____/| | | |  __/ | |
 \\_____|_|\\__|       |_| |_|\\___|_|_|`}
            </pre>
            <p>Welcome to <strong>Git Shell Desktop</strong>! React Terminal Edition.</p>
            <p>Type commands below and hit <kbd>Enter</kbd>.</p>
            <p>💡 Tip: Type <span className="highlight">git expand</span> to open the multi-line script editor.</p>
          </div>
          {entries.map((entry) => (
            <div key={entry.id} className="command-entry">
              <div className="command-line-echo">{entry.promptLabel || promptLabel} {entry.command}</div>
              {entry.result && (
                <div className={`command-result ${entry.isError ? 'error' : ''}`}>
                  {entry.result}
                </div>
              )}
            </div>
          ))}

          <div ref={terminalEndRef} />
        </div>
        <form className="prompt-bar" onSubmit={handleCommandSubmit}>
          <span className="prompt-label">{promptLabel}</span>
          <input
            ref={commandInputRef}
            type="text"
            id="command-input"
            autoComplete="off"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command (e.g. echo hello, git expand)..."
          />
        </form>
      </main>
    </div>
  );
}
