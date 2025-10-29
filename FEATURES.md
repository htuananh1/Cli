# AI Gateway CLI v2.1 - Features

> **Gemini-CLI inspired** - Simple, powerful, unlimited context

## 🎯 Design Philosophy

### Inspired by gemini-cli

This CLI is inspired by Google's [gemini-cli](https://github.com/google-gemini/gemini-cli):

1. **Simplicity First**: No complex commands, just natural conversation
2. **REPL-first Design**: Interactive mode is the primary interface
3. **Slash Commands**: Intuitive `/command` syntax for special actions
4. **Streaming by Default**: See responses as they're generated
5. **File Support**: Easy file inclusion with `/file`

### Key Differences from gemini-cli

- ♾️ **No Token Limits**: We don't artificially limit context - let the API handle it
- 🌐 **Multiple Providers**: Support for DeepSeek, GPT-4, Claude, Gemini, etc.
- 🔄 **Simple Memory**: Session-based conversation history
- 📦 **Minimal**: Single TypeScript file, focused on core experience
- 🚀 **TypeScript**: Full type safety and modern tooling

## ✨ Core Features

### 1. Interactive REPL

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

You> 
```

**Features:**
- Beautiful ASCII art header
- Clear command listing
- Colored prompt and output
- Streaming responses
- Persistent conversation in session

### 2. One-shot Mode

```bash
# Quick questions without entering REPL
ai-gateway "What is recursion?"

# With options
ai-gateway "Explain quantum computing" --model openai/gpt-4

# With file
ai-gateway "Review this code" --file ./app.ts
```

**Features:**
- Fast single-query responses
- No REPL overhead
- Perfect for scripting
- Still supports all options

### 3. Slash Commands

| Command | Purpose | Example |
|---------|---------|---------|
| `/clear` | Clear conversation history | `/clear` |
| `/stats` | Show message counts and model info | `/stats` |
| `/file <path> <msg>` | Include file content in message | `/file code.ts Review this` |
| `/model <name>` | Change model mid-conversation | `/model openai/gpt-4` |
| `/temp <number>` | Adjust temperature (0.0-2.0) | `/temp 0.9` |
| `/help` | Show command list | `/help` |
| `/exit` | Exit interactive mode | `/exit` |

### 4. File Support

```bash
# One-shot with file
ai-gateway "Explain this" --file script.py

# Interactive mode
You> /file ./auth.ts Review security
You> /file ./db.ts Check queries
You> Are these consistent with each other?
```

**Features:**
- Automatic file reading
- Syntax highlighting in prompts
- Multiple file support in one conversation
- Smart file path handling

### 5. Multiple Models

Support for various AI providers including the latest models:

| Provider | Models | Best For |
|----------|--------|----------|
| **DeepSeek** | `deepseek/deepseek-v3.2-exp` | Code, reasoning, default |
| **OpenAI** | `gpt-5`, `gpt-5-codex`, `gpt-4-turbo`, `gpt-4`, `gpt-3.5-turbo` | General purpose, code generation |
| **Anthropic** | `claude-sonnet-4.5`, `claude-haiku-4.5`, `claude-3-opus`, `claude-3-sonnet`, `claude-3-haiku` | Long documents, advanced reasoning |
| **Google** | `gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-pro` | Multimodal, fast processing |

**Latest Models (New!):**
- `anthropic/claude-sonnet-4.5` - Most advanced coding & reasoning
- `anthropic/claude-haiku-4.5` - Fast, efficient tasks  
- `openai/gpt-5` - Next-gen language understanding
- `openai/gpt-5-codex` - Advanced code generation
- `google/gemini-2.5-pro` - Multimodal, long context
- `google/gemini-2.5-flash` - Fast, efficient processing

**Features:**
- Easy model switching with `/model`
- Model displayed in interactive mode
- All models use same interface
- No configuration needed
- Access to cutting-edge AI models

### 6. Temperature Control

Adjust creativity on the fly:

```bash
# In options
ai-gateway "Write a poem" --temperature 1.2

# In interactive mode
You> /temp 0.3  # Precise
You> Explain this algorithm

You> /temp 1.5  # Creative
You> Now write a story about it
```

**Ranges:**
- `0.0-0.3`: Deterministic, precise (code, facts)
- `0.4-0.7`: Balanced (default: 0.7)
- `0.8-1.5`: Creative (writing, brainstorming)
- `1.6-2.0`: Very creative (experimental)

### 7. System Prompts

Set AI behavior:

```bash
# One-shot
ai-gateway --system "You are a Python expert" "How do I use decorators?"

# Interactive
ai-gateway --system "You are a friendly tutor explaining to beginners"
```

**Use cases:**
- Code review: "You are a senior engineer reviewing code"
- Learning: "You are a patient tutor"
- Writing: "You are a professional editor"
- Debugging: "You are a debugging expert"

### 8. Streaming Responses

All responses stream by default:

```
You> Tell me a story

Assistant> Once upon a time, in a land far away...
[text appears as it's generated]
```

**Benefits:**
- See progress immediately
- Better UX for long responses
- Cancel anytime with Ctrl+C
- No waiting for full completion

### 9. Conversation Stats

Track your conversation:

```bash
You> /stats

📊 Conversation Stats:
   Messages: 12
   User: 6 | Assistant: 6
   Model: deepseek/deepseek-v3.2-exp
```

**Shows:**
- Total message count
- User vs Assistant messages
- Current model
- Simple and clean

### 10. Unlimited Context

**No artificial token limits!**

Unlike other CLIs, we don't:
- ❌ Count tokens manually
- ❌ Trim conversations automatically
- ❌ Warn about limits
- ❌ Force context management

Instead:
- ✅ Let the API handle context
- ✅ Trust model's native limits
- ✅ Keep all conversation history
- ✅ Simple session-based memory

**Why this works:**
- Modern models have large context windows
- API knows its own limits
- Simpler UX without warnings
- Matches gemini-cli philosophy

## 🚀 Technical Features

### Clean Architecture

```
src/
└── cli.ts          # Single file (~400 lines)
    ├── Config interface
    ├── Message interface
    ├── GeminiStyleCLI class
    │   ├── chat()
    │   ├── chatWithFile()
    │   ├── clearHistory()
    │   ├── showStats()
    │   └── repl()
    └── Commander.js setup
```

**Benefits:**
- Easy to understand
- Simple to modify
- No complex dependencies
- Fast compile time

### Minimal Dependencies

```json
{
  "dependencies": {
    "openai": "^4.0.0",      // API client
    "commander": "^11.0.0",   // CLI framework
    "chalk": "^4.1.2",        // Colors
    "dotenv": "^16.0.0"       // Env vars
  }
}
```

**No extra:**
- No token counting libraries
- No storage systems
- No complex state management
- No persistence layer

### TypeScript

Full type safety:

```typescript
interface Config {
  apiKey: string;
  baseUrl: string;
  model: string;
  temperature: number;
  systemPrompt?: string;
}

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

### Error Handling

Graceful failures:

```bash
# Missing API key
Error: AI_GATEWAY_API_KEY environment variable not set
Set it with: export AI_GATEWAY_API_KEY="your-key"

# Invalid file
Error reading file: ENOENT: no such file or directory

# API errors
Error: 401 Unauthorized
```

## 🎨 UX Features

### Beautiful Output

- **Colors**: Cyan for AI, Yellow for user, Gray for info
- **Formatting**: Clean boxes, separators, emojis
- **Streaming**: Smooth character-by-character output
- **Stats**: Clean emoji-based statistics

### Keyboard Shortcuts

- `Ctrl+C`: Exit gracefully
- `Ctrl+D`: Exit (Unix)
- `Up/Down`: Command history (readline)

### Smart Defaults

- Default model: `deepseek/deepseek-v3.2-exp`
- Default temperature: `0.7`
- Default mode: Interactive (no args)
- Streaming: Always on

### Helpful Messages

```
Commands:
  /clear     - Clear conversation history
  /stats     - Show conversation statistics
  ...

Just type your message and press Enter to chat!
────────────────────────────────────────────────────────────
```

## 🔒 Security

- API keys from environment only
- No disk persistence (session only)
- Safe file reading with error handling
- No execution of code from files

## 🌟 Why This Design?

### Simplicity

Following gemini-cli's philosophy:
> "Just talk to the AI, don't manage it"

### No Token Management

Let the API handle it:
- Models know their limits
- APIs error gracefully
- Users don't need to think about it
- Simpler mental model

### REPL-first

Interactive is natural:
- Start chatting immediately
- Commands when needed
- No complex state to manage
- Like talking to a person

### File Support

Code review made easy:
- `/file` command is simple
- Works with any text file
- Multiple files in one conversation
- Context preserved

## 📊 Comparison

| Feature | ai-gateway-cli | gemini-cli | Other CLIs |
|---------|---------------|------------|------------|
| **Interactive REPL** | ✅ | ✅ | ⚠️ Some |
| **Unlimited Context** | ✅ | ✅ | ❌ Most limit |
| **Multiple Models** | ✅ | ❌ | ⚠️ Some |
| **File Support** | ✅ | ✅ | ⚠️ Some |
| **Slash Commands** | ✅ | ✅ | ❌ Most don't |
| **Streaming** | ✅ | ✅ | ⚠️ Some |
| **Simple Code** | ✅ ~400 lines | ✅ | ❌ Complex |
| **No Token Counting** | ✅ | ✅ | ❌ Most count |
| **TypeScript** | ✅ | ❌ | ⚠️ Mixed |

## 🎯 Use Cases

Perfect for:
- 💬 Quick questions
- 🧑‍💻 Code reviews
- 📚 Learning sessions
- ✍️ Writing help
- 🐛 Debugging
- 💡 Brainstorming
- 📖 Document analysis

Not for:
- ❌ Production applications (use API directly)
- ❌ Persistent storage needs
- ❌ Multi-user scenarios
- ❌ Complex workflows

---

**Simple, powerful, unlimited. Just like gemini-cli.** 🚀
