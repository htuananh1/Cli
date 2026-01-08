export type TabName = 'chat' | 'file-tree' | 'diff' | 'search';
import { ParsedPatch } from '../core/patch.js';

export interface UIState {
  activeTab: TabName;
  currentFile: string | null;
  searchQuery: string;
  isSidebarOpen: boolean;
  showCommandPalette: boolean;
  paletteMode: 'file' | 'command';
  pendingPatch?: ParsedPatch;
  commandLogs: string[];
  isCommandRunning: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
}
