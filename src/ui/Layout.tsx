import React from 'react';
import { Box, Text } from 'ink';
import { UIState } from './types.js';
import FileTree from './panes/FileTree.js';
import Chat from './panes/Chat.js';
import Editor from './panes/Editor.js';
import DiffView from './panes/DiffView.js';
import CommandOutput from './panes/CommandOutput.js';
import { ChatMessage } from './types.js';

interface LayoutProps {
  state: UIState;
  setState: (state: UIState) => void;
  onNewChatMessage: (msg: ChatMessage) => void;
}

const Layout: React.FC<LayoutProps> = ({ state, setState, onNewChatMessage }) => {
  return (
    <Box flexDirection="column" height="100%" width="100%" borderStyle="single">
      {/* Header */}
      <Box height={1} paddingX={1} borderStyle="single" borderColor="blue">
        <Text>CursCli v0.1 | {state.activeTab.toUpperCase()}</Text>
      </Box>

      {/* Main Content Area */}
      <Box flexGrow={1} flexDirection="row">
        {/* Left Pane: File Tree */}
        {state.isSidebarOpen && (
           <Box width={30} borderStyle="single" borderColor="gray">
             <FileTree />
           </Box>
        )}

        {/* Center Pane: Editor/Diff */}
        <Box flexGrow={1} borderStyle="single" borderColor="white" flexDirection="column">
            <Box flexGrow={1}>
                {state.activeTab === 'diff' ? (
                    <DiffView patch={state.pendingPatch} />
                ) : (
                    <Editor content={state.currentFile ? `Content of ${state.currentFile}` : undefined} filename={state.currentFile || undefined} />
                )}
            </Box>
            {/* Bottom Pane: Command Output (visible if logs exist) */}
            {state.commandLogs.length > 0 && (
                <Box height={10} borderStyle="single" borderColor="gray">
                    <CommandOutput logs={state.commandLogs} />
                </Box>
            )}
        </Box>

        {/* Right Pane: Chat */}
        <Box width={40} borderStyle="single" borderColor="green">
             <Chat onNewMessage={onNewChatMessage} />
        </Box>
      </Box>

      {/* Footer / Status Bar */}
      <Box height={1} paddingX={1} borderStyle="single" borderColor="gray">
        <Text>Status: {state.isCommandRunning ? 'Running...' : 'Ready'} | Ctrl+P: File | Ctrl+K: Cmd | {state.pendingPatch ? 'Ctrl+Enter: Apply Patch' : ''}</Text>
      </Box>
    </Box>
  );
};

export default Layout;
