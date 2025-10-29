# AI Code CLI

> **Cursor-like CLI tool for AI coding assistant** - 99% similar to Cursor CLI

A powerful command-line interface for interacting with AI coding assistants. Built with TypeScript and inspired by Cursor CLI, providing comprehensive code generation, editing, review, and analysis capabilities.

## 🚀 Quick Start

### Installation

```bash
# Install globally
npm install -g ai-code-cli

# Or use npx
npx ai-code-cli "your question"

# Or from source
git clone <repository-url>
cd ai-code-cli
npm install
npm run build
npm link
```

### Initial Setup

```bash
# Initialize configuration
ai-code init

# Set API key (or use environment variable)
export AI_GATEWAY_API_KEY="your-api-key-here"
```

## 📖 Core Commands

### 1. Chat & Interactive Mode

```bash
# Interactive chat session
ai-code

# One-shot questions
ai-code "Explain this code pattern"

# With file context
ai-code "Review this code" -f src/utils.js

# Multiple files
ai-code "Compare these files" -f src/file1.js -f src/file2.js

# Entire directory
ai-code "Analyze this project" --dir ./src
```

### 2. Configuration Management

```bash
# Initialize configuration
ai-code init

# Show current config
ai-code config --show

# Set default model
ai-code config --model claude-sonnet-4

# View all settings
ai-code config
```

Configuration is stored in `.aicoderc.json`:

```json
{
  "model": "deepseek/deepseek-v3.2-exp",
  "apiKey": "sk-...",
  "temperature": 0.7,
  "maxTokens": 4000,
  "defaultFiles": ["package.json", "tsconfig.json"],
  "ignorePatterns": ["node_modules", "dist", "*.min.js"],
  "autoSave": true,
  "previewChanges": true
}
```

## 🛠️ Code Generation & Editing

### Create Files

```bash
# Generate new file
ai-code create "React component for user profile" -o src/UserProfile.jsx

# Create without output path (generates to generated.js)
ai-code create "Express API endpoint for user authentication"
```

### Edit Files

```bash
# Edit with AI
ai-code edit src/api.js "Add error handling and retry logic"

# Preview changes before applying
ai-code edit src/app.ts "Refactor to TypeScript strict mode" --preview

# Apply previewed changes
ai-code apply

# Reject previewed changes
ai-code reject
```

## 🔍 Code Review & Analysis

### Review Code

```bash
# Review single file
ai-code review src/payment.js

# Review git branch changes
ai-code review --branch feature/new-api
```

### Security Audit

```bash
# Audit file or directory
ai-code security src/auth/
ai-code security src/payment.js
```

### Performance Analysis

```bash
# Analyze code structure
ai-code analyze src/

# Performance-specific analysis
ai-code analyze src/ --performance
```

## 🐛 Debugging & Testing

### Debug Code

```bash
# Debug with error message
ai-code debug "Cannot read property of undefined" -f src/app.js

# Debug without file
ai-code debug "TypeError: undefined is not a function"
指引
```

### Generate Tests

```bash
# Generate tests for file
ai-code test src/calculator.js

# Specify test framework
ai-code test src/api.js --framework jest
ai-code test src/api.js --framework mocha
```

### Fix Failing Tests

```bash
# Fix test file
ai-code fix-tests tests/api.test.js
```

## 📝 Documentation

### Generate Documentation

```bash
# Generate docs for file
ai-code docs src/api.js

# Creates src/api.md with comprehensive documentation
```

### Generate README

```bash
# Generate README for current project
ai-code readme

# For specific directory
ai-code readme --project ./my-project
```

### Add Inline Comments

```bash
# Add comments to code
ai-code comment src/complex-logic.js
```

## 📁 Context Management

```bash
# Add files to context
ai-code context add src/models/*.js

# List context files
ai-code context list

# Clear context
ai-code context clear

# Save context session
ai-code context save my-session

# Load saved session
ai-code context load my-session
```

## 🔄 Git Integration

### Commit Messages

```bash
# Generate commit message from staged changes
ai-code commit
```

### PR Descriptions

```bash
# Generate PR description from branch changes
ai-code pr-description
```

### Diff Analysis

```bash
# Compare two files
ai-code diff file1.js file2.js "Explain the differences"

# Analyze staged changes
ai-code diff --staged "Review these changes"
```

## 💬 Interactive Mode

Start an interactive session:

```bash
ai-code
```

### Interactive Commands

| Command | Description |
|---------|-------------|
| `/clear` | Clear conversation history |
| `/stats` | Show conversation statistics |
| `/model <name>` | Change AI model |
| `/temp <0.0-2.0>` | Change temperature |
| `/config` | Show configuration |
| `/help` | Show help |
| `/exit` | Exit interactive mode |

### Example Session

```
You> Explain async/await in JavaScript

Assistant> [detailed explanation...]

You> /model claude-sonnet-4

You> Now give me advanced examples

Assistant> [advanced examples...]

You> /stats
📊 Conversation Stats:
   Messages: 4
   User: 2 | Assistant: 2
   Model: claude-sonnet-4
   Temperature: 0.7
```

## 🎯 Available Models

### Latest Models (Recommended)

| Model | Provider | Best For |
|-------|----------|----------|
| `anthropic/claude-sonnet-4.5` | Anthropic | Advanced coding & reasoning |
| `anthropic/claude-haiku-4.5` | Anthropic | Fast, efficient tasks |
| `openai/gpt-5` | OpenAI | Next-gen language understanding |
| `openai/gpt-5-codex` | OpenAI | Advanced code generation |
| `google/gemini-2.5-pro` | Google | Multimodal, long context |
| `google/gemini-2.5-flash` | Google | Fast processing |
| `deepseek/deepseek-v3.2-exp` | DeepSeek | Code, reasoning (default) |

### Previous Generation

- `openai/gpt-4-turbo`, `openai/gpt-4`, `openai/gpt-3.5-turbo`
- `anthropic/claude-3-opus`, `anthropic/claude-3-sonnet`, `anthropic/claude-3-haiku`
- `google/gemini-pro`

## 📋 Complete Command Reference

### Core Commands

```bash
# Chat
ai-code [message]                    # Chat with AI
ai-code [message] -f <file>          # Chat with file
ai-code [message] --dir <dir>        # Chat with directory
ai-code chat                         # Start interactive session

# Configuration
ai-code init                         # Initialize config
ai-code config --show                # Show config
ai-code config --model <model>       # Set model
```

### Code Operations

```bash
# Generation & Editing
ai-code create <prompt> [-o <file>]  # Create file
ai-code edit <file> [instruction]    # Edit file
ai-code edit <file> --preview        # Preview changes
ai-code apply                        # Apply changes
ai-code reject                       # Reject changes

# Review & Analysis
ai-code review <file>                # Review code
ai-code security [path]              # Security audit
ai-code analyze [path]               # Analyze code
ai-code analyze [path] --performance # Performance analysis

# Debugging
ai-code debug <error> [-f <file>]    # Debug error
ai-code test <file>                  # Generate tests
ai-code test <file> --framework <fw> # With framework
ai-code fix-tests <testfile>         # Fix failing tests

# Documentation
ai-code docs <file>                  # Generate docs
ai-code readme [--project <path>]    # Generate README
ai-code comment <file>               # Add comments
```

### Context & Git

```bash
# Context Management
ai-code context add <pattern>        # Add to context
ai-code context list                 # List context
ai-code context clear                # Clear context
ai-code context save <name>          # Save session
ai-code context load <name>          # Load session

# Git Integration
ai-code commit                       # Generate commit message
ai-code pr-description               # Generate PR description
ai-code diff <file1> <file2> [prompt] # Compare files
ai-code diff --staged [prompt]       # Analyze staged changes
```

## ⚙️ Configuration File

Create `.aicoderc.json` in your project root:

```json
{
  "model": "claude-sonnet-4",
  "apiKey": "sk-...",
  "temperature": 0.7,
  "maxTokens": 4000,
  "defaultFiles": ["package.json", "tsconfig.json"],
  "ignorePatterns": ["node_modules", "dist", "*.min.js", ".git"],
  "autoSave": true,
  "previewChanges": true,
  "plugins": [],
  "shortcuts": {
    "fix": "Fix all errors in this file",
    "opt": "Optimize performance"
  },
  "exclude": ["*.env", "secrets/*"]
}
```

## 🎨 Usage Examples

### Code Generation Workflow

```bash
# 1. Generate component
ai-code create "React login form component" -o src/Login.jsx

# 2. Review it
ai-code review src/Login.jsx

# 3. Add tests
ai-code test src/Login.jsx --framework jest

# 4. Generate docs
ai-code docs src/Login.jsx
```

### Code Review Session

```bash
# Interactive review
ai-code

You> /file src/auth.js Review this authentication code
You> Check for security vulnerabilities
You> Suggest improvements
You> /stats
```

### Git Workflow

```bash
# 1. Make changes and stage them
git add .

# 2. Generate commit message
ai-code commit

# 3. Create PR description
ai-code pr-description

# 4. Review diff
ai-code diff --staged "Are these changes safe?"
```

## 🔒 Security

- API keys stored securely in config or environment variables
- Files matching ignore patterns are excluded
- Preview mode for review before applying changes
- Automatic backups before edits

## 🛠️ Development

### Project Structure

```
ai-code-cli/
├── src/
│   ├── cli.ts          # Main CLI
│   ├── config.ts       # Configuration management
│   ├── context.ts      # Context management
│   └── edits.ts        # Edit management
├── dist/               # Compiled output
├── package.json
└── README.md
```

### Build & Run

```bash
# Development
npm run dev

# Build
npm run build

# Run compiled
node dist/cli.js
```

## 📊 Features Comparison

| Feature | AI Code CLI | Cursor CLI |
|---------|-------------|------------|
| Chat with AI | ✅ | ✅ |
| Code Generation | ✅ | ✅ |
| Code Editing | ✅ | ✅ |
| Preview Changes | ✅ | ✅ |
| Code Review | ✅ | ✅ |
| Security Audit | ✅ | ✅ |
| Performance Analysis | ✅ | ✅ |
| Test Generation | ✅ | ✅ |
| Documentation | ✅ | ✅ |
| Git Integration | ✅ | ✅ |
| Context Management | ✅ | ✅ |
| Multiple Models | ✅ | ⚠️ Limited |

## 🐛 Troubleshooting

### API Key Not Found

```bash
# Set environment variable
export AI_GATEWAY_API_KEY="your-key"

# Or run init
ai-code init
```

### Model Not Available

Check available models:
```bash
ai-code --help
```

### Preview Not Working

Make sure you use `--preview` flag:
```bash
ai-code edit file.js "changes" --preview
ai-code apply  # To apply
ai-code reject # To cancel
```

## 📝 License

MIT

## 🙏 Credits

Inspired by Cursor CLI and built with modern AI models through AI Gateway.

---

**Happy coding! 🚀**
