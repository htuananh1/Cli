# Quick Start - AI Gateway CLI v2.1

## 🚀 5-Minute Setup

### 1. Install

```bash
git clone <your-repo>
cd ai-gateway-cli
npm install
npm run build
npm link
```

### 2. Set API Key

```bash
export AI_GATEWAY_API_KEY="your-api-key-here"
```

### 3. Start Chatting!

```bash
# Interactive mode
ai-gateway

# Or quick question
ai-gateway "Hello, who are you?"
```

## 💬 Interactive Mode

```
You> Hello!

Assistant> Hi! How can I help you today?

You> Explain recursion

Assistant> [detailed explanation...]

You> /stats
📊 Conversation Stats:
   Messages: 4
   User: 2 | Assistant: 2
   Model: deepseek/deepseek-v3.2-exp

You> /exit
👋 Goodbye!
```

## 🎯 Common Commands

### Quick Questions

```bash
ai-gateway "What is TypeScript?"
ai-gateway "Write a haiku about coding"
ai-gateway "Explain async/await"
```

### With Options

```bash
# Different model
ai-gateway "Complex task" --model openai/gpt-4

# Creative writing
ai-gateway "Write a story" --temperature 1.2

# With system prompt
ai-gateway --system "You are a Python expert"
```

### File Analysis

```bash
# One-shot
ai-gateway "Review this" --file code.ts

# Interactive
ai-gateway
You> /file ./app.ts Explain this code
You> /file ./test.ts Compare with this test
```

## 📋 Interactive Commands

| Command | What it does |
|---------|--------------|
| `/clear` | Clear conversation history |
| `/stats` | Show conversation stats |
| `/file <path> <message>` | Include file content |
| `/model <name>` | Change model |
| `/temp <0.0-2.0>` | Change temperature |
| `/help` | Show all commands |
| `/exit` | Quit |

## 💡 Pro Tips

### 1. Start Interactive by Default

Just type `ai-gateway` - no commands needed!

### 2. Use System Prompts

```bash
ai-gateway --system "You are a senior developer doing code review"
```

### 3. Change Models Mid-Chat

```bash
You> Simple explanation please
Assistant> [explains...]

You> /model anthropic/claude-3-opus
You> Now the advanced version
```

### 4. Multiple Files

```bash
You> /file ./src/api.ts Review backend
You> /file ./src/client.ts Check frontend
You> Are there any inconsistencies?
```

### 5. Temperature Guide

- `0.0-0.3` = Precise (code, math, facts)
- `0.7` = Balanced (default)
- `1.0-1.5` = Creative (writing, ideas)

## 🎨 Use Cases

### Code Help

```bash
ai-gateway --system "TypeScript expert"
You> How do I use generics?
You> Show me an example
You> /file ./types.ts Review my types
```

### Learning

```bash
ai-gateway --model anthropic/claude-3-opus
You> Teach me about Docker
You> What are containers?
You> Show me a Dockerfile example
```

### Writing

```bash
ai-gateway -t 1.0
You> Help me write a blog post about AI
You> Make it more engaging
You> Add a conclusion
```

## 🔧 Troubleshooting

### API Key Error

```bash
# Set it
export AI_GATEWAY_API_KEY="your-key"

# Or pass inline
ai-gateway --api-key "your-key" "Hello"
```

### Model Not Available

Check the model name:
```bash
ai-gateway --help  # See available options
```

Common models:
- `deepseek/deepseek-v3.2-exp` (default)
- `openai/gpt-4`
- `anthropic/claude-3-opus`

### Command Not Found

```bash
# Make sure you linked it
cd /path/to/ai-gateway-cli
npm link

# Or run directly
node dist/cli.js
```

## 🎯 Next Steps

- Check out [README.md](README.md) for full documentation
- Try different models and temperatures
- Use system prompts for specialized tasks
- Experiment with `/file` for code reviews

---

**Start chatting now:** `ai-gateway` 🚀
