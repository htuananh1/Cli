# CursCli

A production-quality CLI coding assistant with a modern Terminal UI (TUI).

## Features

- **TUI Interface**: Panes/tabs for chat, file explorer, diff preview, and command runner.
- **Project Indexing**: Fast file search and basic content search.
- **Chat Assistant**: Mock provider (extensible to OpenAI/Anthropic) capable of generating patches.
- **Patch Workflow**: Safe, reviewable code edits via unified diff patches with backup support.
- **Command Runner**: Execute shell commands directly from the UI.
- **Git Integration**: View git status and stage files (basic integration).

## Tech Stack

- **Runtime**: Node.js (TypeScript)
- **TUI**: Ink (React for terminal)
- **Git**: simple-git
- **Patch**: diff

## Installation

```bash
npm install
npm run build
```

## Usage

Start the TUI:

```bash
npm start
# OR
node dist/index.js start
```

### Shortcuts

- `Ctrl+P`: Open File (fuzzy search mock)
- `Ctrl+K`: Command Palette
- `Ctrl+B`: Toggle File Tree
- `Ctrl+Enter`: Apply pending patch (when in Diff View)
- `Esc`: Close Palette

## Demo Script

See [docs/demo.md](docs/demo.md) for a walkthrough.
