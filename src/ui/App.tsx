import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { UIState, ChatMessage } from './types.js';
import Layout from './Layout.js';
import { MockProvider } from '../providers/mock.js';
import Palette from './components/Palette.js';
import { parsePatch, applyPatch } from '../core/patch.js';
import { runCommand } from '../core/commands.js';

const App = () => {
  const [state, setState] = useState<UIState>({
    activeTab: 'chat',
    currentFile: null,
    searchQuery: '',
    isSidebarOpen: true,
    showCommandPalette: false,
    paletteMode: 'file',
    pendingPatch: undefined,
    commandLogs: [],
    isCommandRunning: false
  });

  const handleNewChatMessage = (msg: ChatMessage) => {
    if (msg.role === 'assistant' && msg.content.includes('```diff')) {
        const match = msg.content.match(/```diff([\s\S]*?)```/);
        if (match) {
            const patchContent = match[1];
            const parsed = parsePatch(patchContent);
            setState(s => ({
                ...s,
                pendingPatch: parsed,
                activeTab: 'diff'
            }));
        }
    }
  };

  const executeCommand = (cmd: string) => {
      setState(s => ({ ...s, isCommandRunning: true, commandLogs: [`> ${cmd}`] }));
      runCommand(cmd,
          (data) => setState(s => ({ ...s, commandLogs: [...s.commandLogs, ...data.trim().split('\n')] })),
          (code) => setState(s => ({ ...s, isCommandRunning: false, commandLogs: [...s.commandLogs, `Exited with code ${code}`] }))
      );
  };

  useInput(async (input, key) => {
    // Global Shortcuts
    if (key.ctrl && input === 'p') {
      setState(s => ({ ...s, showCommandPalette: true, paletteMode: 'file' }));
    }
    if (key.ctrl && input === 'k') {
        setState(s => ({ ...s, showCommandPalette: true, paletteMode: 'command' }));
    }
    // Toggle Sidebar
    if (key.ctrl && input === 'b') {
        setState(s => ({ ...s, isSidebarOpen: !s.isSidebarOpen }));
    }

    // Apply Patch
    if (key.ctrl && key.return && state.pendingPatch) {
        const result = await applyPatch(state.pendingPatch);
        if (result.success) {
             setState(s => ({ ...s, pendingPatch: undefined, activeTab: 'chat', commandLogs: [...s.commandLogs, 'Patch applied successfully'] }));
        } else {
             setState(s => ({ ...s, commandLogs: [...s.commandLogs, `Patch failed: ${result.error}`] }));
        }
    }
  });

  const handlePaletteSelect = (item: string) => {
    if (state.paletteMode === 'file') {
        setState(s => ({ ...s, currentFile: item, showCommandPalette: false }));
    } else {
        // Execute command
        setState(s => ({ ...s, showCommandPalette: false }));
        // Map friendly name to actual command
        const cmdMap: Record<string, string> = {
            'Run Tests': 'npm test',
            'Lint': 'npm run lint',
            'Build': 'npm run build',
            'Doctor': 'node dist/index.js doctor'
        };
        const cmd = cmdMap[item];
        if (cmd) executeCommand(cmd);
    }
  };

  return (
    <>
      <Layout state={state} setState={setState} onNewChatMessage={handleNewChatMessage} />
      {state.showCommandPalette && (
         <Box position="absolute" marginTop={2} marginLeft={10}>
             <Palette
                mode={state.paletteMode}
                onClose={() => setState(s => ({ ...s, showCommandPalette: false }))}
                onSelect={handlePaletteSelect}
             />
         </Box>
      )}
    </>
  );
};

export default App;
