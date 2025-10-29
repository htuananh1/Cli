# AI Gateway CLI v2.1

> **Talk to AI models with unlimited context** - Inspired by [gemini-cli](https://github.com/google-gemini/gemini-cli)

A simple, powerful command-line interface for interacting with AI models through AI Gateway. Built with TypeScript and designed for natural conversations without token limits.

## ✨ Features

- 🚀 **Simple & Fast**: Just type and chat, no complex commands
- 💬 **Interactive REPL**: Gemini-CLI inspired conversational interface
- ♾️ **Unlimited Context**: No token limits - let the API handle it
- 📁 **File Support**: Chat about code and documents
- 🎨 **Gemini UI**: Conversation bubbles styled like gemini-cli
- 🧭 **Context-Aware Prompt**: Built-in system prompt keeps replies grounded in history
- 🔄 **Conversation Memory**: History maintained in session
- 🎯 **Multiple Models**: DeepSeek, GPT-4, Claude, Gemini, and more

## 🚀 Quick Start

### Installation

#### Option 1: Install from Source

```bash
# Clone the repository
git clone <repository-url>
cd ai-gateway-cli

# Install dependencies
npm install

# Build the project
npm run build

# Link globally to use 'ai-gateway' command anywhere
npm link
```

#### Option 2: Install via NPM (if published)

```bash
# Install globally
npm install -g ai-gateway-cli

# Or use npx without installation
npx ai-gateway-cli
```

#### Option 3: Run with ts-node (Development)

```bash
# Install dependencies
npm install

# Run directly with ts-node
npx ts-node src/cli.ts
```

### Setup API Key

```bash
export AI_GATEWAY_API_KEY="your-api-key-here"
```

### Basic Usage

```bash
# Interactive mode (default)
ai-gateway

# One-shot question
ai-gateway "Why is the sky blue?"

# With specific model
ai-gateway "Explain quantum computing" --model openai/gpt-4

# With file
ai-gateway "Review this code" --file ./src/app.ts

# With system prompt
ai-gateway --system "You are a helpful coding assistant"
```

## 💬 Interactive Mode

Just run `ai-gateway` to start chatting:

```
╔════════════════════════════════════════════════════════════╗
║            AI Gateway CLI - Interactive Mode                ║
╚════════════════════════════════════════════════════════════╝

Model: deepseek/deepseek-v3.2-exp
Temperature: 0.7

Commands:
  /clear     - Clear conversation history
  /stats     - Show conversation statistics
  /file      - Chat with file content
  /model     - Change model
  /temp      - Change temperature
  /exit      - Exit (or Ctrl+C)
  /help      - Show this help

Just type your message and press Enter to chat!
────────────────────────────────────────────────────────────

You> Hello! How are you?

Assistant> [streaming response...]
```

### Interactive Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/clear` | Clear conversation history | `/clear` |
| `/stats` | Show conversation statistics | `/stats` |
| `/file` | Chat with file content | `/file ./code.ts Review this` |
| `/read` | Preview a file with line numbers | `/read ./src/app.ts` |
| `/write` | Overwrite a file with new content | `/write ./notes.txt "Hello"` |
| `/append` | Append text to a file | `/append ./notes.txt "More"` |
| `/shell` | Run a shell command | `/shell ls -la` |
| `/prompt` | View or update the contextual system prompt | `/prompt You are a creative tutor` |
| `/model` | Change or view current model | `/model openai/gpt-4` |
| `/temp` | Change temperature (0.0-2.0) | `/temp 0.9` |
| `/exit` | Exit interactive mode | `/exit` |
| `/help` | Show help message | `/help` |

## 📖 Usage Examples

### Quick Questions

```bash
# Simple question
ai-gateway "What is recursion?"

# With specific temperature
ai-gateway "Write a poem" --temperature 1.2

# JSON formatting
ai-gateway "List 5 colors in JSON format"
```

### Code Review

```bash
# Review a file
ai-gateway "Review this code for bugs" --file ./auth.ts

# Interactive code review
ai-gateway --system "You are a senior code reviewer"
You> Let's review my authentication system
You> /file ./auth.ts Analyze security
You> /file ./db.ts Check database queries
```

### Learning Sessions

```bash
# Start learning session
ai-gateway --system "You are a patient tutor" --model anthropic/claude-3-opus

You> Explain distributed systems
Assistant> [detailed explanation...]

You> Can you give examples?
Assistant> [examples with context from previous answer...]

You> How does this relate to microservices?
Assistant> [connects to earlier discussion...]
```

### Creative Writing

```bash
ai-gateway --temperature 1.0 --system "You are a creative writing partner"

You> Let's write a sci-fi story about AI
Assistant> [creative ideas...]

You> I like idea #2, develop it more
Assistant> [builds on previous ideas...]
```

### File Analysis

```bash
# Analyze code
ai-gateway "Explain this code" --file ./complex-algo.ts

# Compare files in interactive mode
ai-gateway
You> /file ./v1.ts Analyze this version
You> /file ./v2.ts Compare with previous version
```

## 🎯 Available Models

### Latest Models (Recommended)

| Model | Provider | Best For |
|-------|----------|----------|
| `anthropic/claude-sonnet-4.5` | Anthropic | Most advanced coding & reasoning |
| `anthropic/claude-haiku-4.5` | Anthropic | Fast, efficient tasks |
| `openai/gpt-5` | OpenAI | Next-gen language understanding |
| `openai/gpt-5-codex` | OpenAI | Advanced code generation |
| `google/gemini-2.5-pro` | Google | Multimodal, long context |
| `google/gemini-2.5-flash` | Google | Fast, efficient processing |
| `deepseek/deepseek-v3.2-exp` | DeepSeek | Code, reasoning (default) |

### Previous Generation Models

| Model | Provider | Best For |
|-------|----------|----------|
| `openai/gpt-4-turbo` | OpenAI | Long context, complex tasks |
| `openai/gpt-4` | OpenAI | High quality responses |
| `openai/gpt-3.5-turbo` | OpenAI | Fast, simple tasks |
| `anthropic/claude-3-opus` | Anthropic | Long documents, analysis |
| `anthropic/claude-3-sonnet` | Anthropic | Balanced performance |
| `anthropic/claude-3-haiku` | Anthropic | Fast, simple tasks |
| `google/gemini-pro` | Google | Multimodal tasks |

View all models:
```bash
ai-gateway --help

# Or in interactive mode
You> /model
```

### Model Examples

```bash
# Use Claude Sonnet 4.5 for advanced coding
ai-gateway --model anthropic/claude-sonnet-4.5 "Refactor this code to use async/await"

# Use GPT-5 for complex reasoning
ai-gateway --model openai/gpt-5 "Explain quantum entanglement simply"

# Use Gemini 2.5 Flash for quick tasks
ai-gateway --model google/gemini-2.5-flash "Summarize this article"

# Use GPT-5 Codex for code generation
ai-gateway --model openai/gpt-5-codex "Create a REST API with authentication"
```

## 🔧 CLI Options

```bash
ai-gateway [message] [options]

Options:
  -m, --model <model>         Model to use (default: deepseek/deepseek-v3.2-exp)
  -t, --temperature <number>  Temperature 0.0-2.0 (default: 0.7)
  -s, --system <prompt>       System prompt
  -f, --file <path>           Include file content
  --api-key <key>             API key (overrides env var)
  --base-url <url>            API base URL
  -h, --help                  Show help
  -V, --version               Show version
```

## 🌟 Why This CLI?

### Inspired by gemini-cli

This CLI takes inspiration from Google's excellent [gemini-cli](https://github.com/google-gemini/gemini-cli):

- **Simple UX**: No complex commands, just chat naturally
- **REPL-first**: Interactive mode as the primary interface
- **Slash commands**: Intuitive `/command` syntax
- **File support**: Easy file inclusion
- **Stream by default**: See responses as they're generated

### Key Differences

- ♾️ **No Token Limits**: We don't artificially limit context
- 🎯 **Multiple Models**: Not just one provider
- 🔄 **In-memory History**: Simple session-based memory
- 📝 **Simpler**: Focused on core chat experience

## 📚 Examples

### Multi-turn Conversation

```bash
ai-gateway

You> I'm building a REST API in Node.js
Assistant> Great! What kind of API are you building?

You> A todo app backend
Assistant> [suggestions for todo API...]

You> Show me code for the user authentication
Assistant> [provides code with context of todo app...]

You> /stats
📊 Conversation Stats:
   Messages: 6
   User: 3 | Assistant: 3
   Model: deepseek/deepseek-v3.2-exp
```

### Debug Session

```bash
ai-gateway --system "You are a debugging expert"

You> /file ./app.ts My app crashes on startup
Assistant> [analyzes code...]

You> Here's the error log: [paste error]
Assistant> [diagnoses with code context...]

You> /temp 0.3  # Lower temperature for precise fixes
✓ Temperature set to: 0.3

You> What's the fix?
Assistant> [provides specific solution...]
```

### Brainstorming

```bash
ai-gateway -t 1.2 --system "Creative brainstorming partner"

You> App idea: AI-powered task manager
Assistant> [creative ideas...]

You> Expand on idea #3
Assistant> [detailed expansion...]

You> Now list technical requirements
Assistant> [concrete requirements based on brainstorm...]
```

## 💡 Tips & Tricks

### 1. Use System Prompts

```bash
ai-gateway --system "You are a Python expert. Always show code examples."
```

### 2. Adjust Temperature

- **0.0-0.3**: Precise, deterministic (code, facts)
- **0.4-0.7**: Balanced (default)
- **0.8-1.5**: Creative (writing, brainstorming)
- **1.6-2.0**: Very creative (experimental)

### 3. Change Models Mid-conversation

```bash
You> Explain this concept simply
Assistant> [explains...]

You> /model openai/gpt-4
✓ Model changed to: openai/gpt-4

You> Now give me the advanced details
Assistant> [detailed explanation with new model...]
```

### 4. File Reviews

```bash
# In interactive mode
You> /file ./package.json Review dependencies
You> /file ./tsconfig.json Check TypeScript config
You> Are there any conflicts between these configs?
```

### 5. Keyboard Shortcuts

- `Ctrl+C`: Exit interactive mode
- `Ctrl+D`: Exit interactive mode (Unix)

## 🛠️ Development

### Project Structure

```
ai-gateway-cli/
├── src/
│   └── cli.ts           # Main CLI (simplified)
├── dist/                # Compiled output
├── package.json
├── tsconfig.json
└── README.md
```

### Build & Run

```bash
# Development
npm run dev -- "Hello world"

# Build
npm run build

# Run
node dist/cli.js

# Or after npm link
ai-gateway
```

## 🔒 Security

- API keys stored in environment variables
- File content read safely
- No data persisted to disk (session only)

## 🐛 Troubleshooting

### "API key not set"

```bash
export AI_GATEWAY_API_KEY="your-key"
# Or
ai-gateway --api-key "your-key"
```

### "Model not found"

Check available models:
```bash
ai-gateway --help
```

### Streaming not working

Some terminals may not support streaming. The CLI will fall back gracefully.

## 📝 License

MIT

## 🙏 Credits

Inspired by:
- [gemini-cli](https://github.com/google-gemini/gemini-cli) - Google's Gemini CLI
- [AI Gateway](https://ai-gateway.vercel.sh) - Multi-provider AI gateway

---

**Happy chatting! 🤖💬**

## 📋 System Requirements

- **Node.js**: 16.0.0 or higher
- **npm**: 7.0.0 or higher
- **Operating System**: macOS, Linux, or Windows (with WSL recommended)
- **API Key**: AI Gateway API key (set as `AI_GATEWAY_API_KEY` environment variable)

## Quick Reference

```bash
# Start interactive mode
ai-gateway

# Quick question  
ai-gateway "your question"

# With file
ai-gateway "review this" --file code.ts

# Use latest models
ai-gateway --model anthropic/claude-sonnet-4.5 "your question"
ai-gateway --model openai/gpt-5 "your question"
ai-gateway --model google/gemini-2.5-pro "your question"

# Creative mode
ai-gateway --temperature 1.2

# Custom system prompt
ai-gateway --system "You are a helpful assistant"

# In interactive mode:
/clear    # Clear history
/stats    # Show stats
/file     # Include file
/model    # Change model (shows all available models)
/temp     # Change temperature
/exit     # Quit
```

## 🔥 Pro Tips

### Best Model for Each Task

```bash
# Code Generation & Debugging
ai-gateway --model openai/gpt-5-codex

# Complex Reasoning & Analysis  
ai-gateway --model anthropic/claude-sonnet-4.5

# Fast Prototyping
ai-gateway --model google/gemini-2.5-flash

# Long Context Processing
ai-gateway --model google/gemini-2.5-pro

# General Purpose (Best Balance)
ai-gateway --model openai/gpt-5
```

### Environment Variables

```bash
# Required
export AI_GATEWAY_API_KEY="your-api-key"

# Optional
export AI_GATEWAY_BASE_URL="https://ai-gateway.vercel.sh/v1"
```
