# AI Gateway CLI v2.0

A powerful command-line interface for interacting with AI models through the AI Gateway service. Built with TypeScript and Node.js, this CLI provides an easy way to chat with various AI models including DeepSeek, OpenAI GPT, Claude, Gemini, and more.

## 🆕 Version 2.0 - Memory & Token Management

**NEW in v2.0:**
- 🧠 **Conversation Memory**: Save and load conversations with full context
- 📊 **Token Counting**: Real-time token usage tracking and display
- 🔄 **Auto Context Management**: Automatic trimming when token limits reached
- 💾 **Persistent Storage**: All conversations saved to disk
- 📤 **Export to Markdown**: Share conversations easily
- 📚 **Conversation Management**: List, show, delete conversations

## Features

- 🚀 **Simple Chat Interface**: Send single prompts or have interactive conversations
- 🔄 **Streaming Support**: Real-time streaming responses with beautiful output
- 🎯 **Multiple Models**: Support for various AI models (DeepSeek, GPT-4, Claude, etc.)
- 💾 **JSON Output**: Get structured JSON responses for programmatic use
- 🎨 **System Prompts**: Customize AI behavior with system prompts
- ⚙️ **Configurable**: Control temperature, max tokens, and more
- 🔐 **Secure**: Uses environment variables for API key management
- 🎭 **Interactive Mode**: Full conversation support with context
- 🌈 **Colorful Output**: Beautiful terminal UI with colors and spinners
- 🧠 **Memory System**: Conversations persist across sessions
- 📊 **Token Management**: Track and optimize token usage

## Quick Start với npx

Chạy ngay lập tức mà không cần cài đặt:

```bash
# Set API key
export AI_GATEWAY_API_KEY="your-api-key-here"

# Chạy với npx (sau khi publish)
npx ai-gateway-cli chat "Why is the sky blue?"
```

## Installation

### Cài đặt toàn cục

```bash
npm install -g ai-gateway-cli
```

### Cài đặt cho development

```bash
# Clone repo
git clone <repo-url>
cd ai-gateway-cli

# Cài đặt dependencies
npm install

# Build project
npm run build

# Link để sử dụng locally
npm link
```

## Configuration

Tạo file `.env` trong thư mục dự án hoặc set environment variables:

```bash
export AI_GATEWAY_API_KEY="your-api-key-here"
export AI_GATEWAY_BASE_URL="https://ai-gateway.vercel.sh/v1"  # Optional
```

Hoặc copy từ file mẫu:

```bash
cp .env.example .env
# Sau đó edit .env và thêm API key của bạn
```

## Usage

### Basic Chat

Gửi một tin nhắn đơn giản:

```bash
ai-gateway chat "Why is the sky blue?"
```

### 🆕 Chat với Conversation Memory

```bash
# Start với conversation ID để AI nhớ context
ai-gateway chat "My name is Alice" --conversation-id conv_123

# Tiếp tục conversation
ai-gateway chat "What's my name?" --conversation-id conv_123
# AI sẽ nhớ: "Your name is Alice"
```

### Với model khác

```bash
ai-gateway chat "Explain quantum computing" --model openai/gpt-4
```

### Với System Prompt

```bash
ai-gateway chat "Write a poem about autumn" --system "You are a creative poet who writes in haiku style"
```

### Streaming Responses

Xem response real-time khi AI đang generate:

```bash
ai-gateway chat "Tell me a story" --stream
```

### JSON Output

Nhận response dạng JSON để xử lý:

```bash
ai-gateway chat "Hello, AI!" --json
```

### 🆕 Interactive Mode với Auto-Save

Bắt đầu cuộc trò chuyện tương tác với memory:

```bash
# Tự động lưu conversation
ai-gateway interactive --auto-save

# Hoặc tiếp tục conversation cũ
ai-gateway interactive --conversation-id conv_123
```

Trong interactive mode:
- Gõ tin nhắn và nhận response
- Gõ `clear` để xóa lịch sử hội thoại
- Gõ `save` để lưu conversation
- Gõ `tokens` để xem token usage
- Gõ `exit` hoặc `quit` để kết thúc
- Nhấn Ctrl+C để thoát

### Interactive với Custom Model

```bash
ai-gateway interactive --model anthropic/claude-3-sonnet --auto-save
```

### 🆕 Conversation Management

```bash
# List tất cả conversations đã lưu
ai-gateway conversations

# Xem chi tiết một conversation
ai-gateway show conv_123456

# Delete conversation
ai-gateway delete conv_123456

# Export conversation ra markdown
ai-gateway export conv_123456 output.md
```

### 🆕 Token Management

```bash
# Set max context tokens để control memory usage
ai-gateway interactive --max-context-tokens 10000 --auto-save

# CLI tự động trim old messages khi đạt limit
```

### Advanced Options

```bash
ai-gateway chat "Explain AI" \
  --model openai/gpt-4 \
  --temperature 0.9 \
  --max-tokens 500 \
  --system "You are a helpful AI assistant" \
  --stream
```

### List Available Models

```bash
ai-gateway list-models
```

## Available Models

CLI hỗ trợ nhiều models với token limits:

| Model | Context Window |
|-------|----------------|
| **DeepSeek**: `deepseek/deepseek-v3.2-exp` | 32K tokens |
| **OpenAI**: `openai/gpt-4-turbo` | 128K tokens |
| **OpenAI**: `openai/gpt-4` | 8K tokens |
| **OpenAI**: `openai/gpt-3.5-turbo` | 4K tokens |
| **Anthropic**: `anthropic/claude-3-opus` | 200K tokens |
| **Anthropic**: `anthropic/claude-3-sonnet` | 200K tokens |
| **Anthropic**: `anthropic/claude-3-haiku` | 200K tokens |
| **Google**: `google/gemini-pro` | 32K tokens |
| **Meta**: `meta-llama/llama-3-70b` | 8K tokens |
| **Mistral**: `mistralai/mixtral-8x7b` | 8K tokens |

Xem token limits:
```bash
ai-gateway list-models
```

## Command Reference

### `chat` - Gửi một tin nhắn

```bash
ai-gateway chat <prompt> [options]
```

**Options:**
- `-m, --model <model>`: Model sử dụng (default: deepseek/deepseek-v3.2-exp)
- `-s, --system <prompt>`: System prompt để set context
- `-t, --temperature <number>`: Temperature 0-2 (default: 0.7)
- `--max-tokens <number>`: Số tokens tối đa cho response
- `--max-context-tokens <number>`: Số tokens tối đa cho context
- `--stream`: Stream response real-time
- `--json`: Output dạng JSON
- `-c, --conversation-id <id>`: Continue từ conversation có sẵn

### `interactive` - Interactive chat session

```bash
ai-gateway interactive [options]
```

**Options:**
- `-m, --model <model>`: Model sử dụng (default: deepseek/deepseek-v3.2-exp)
- `-s, --system <prompt>`: System prompt để set context
- `-t, --temperature <number>`: Temperature 0-2 (default: 0.7)
- `-c, --conversation-id <id>`: Continue từ conversation có sẵn
- `--max-context-tokens <number>`: Số tokens tối đa cho context
- `--auto-save`: Tự động lưu conversation

**Interactive Commands:**
- `exit` / `quit` - Thoát
- `clear` - Xóa history
- `save` - Lưu conversation
- `tokens` - Hiển thị token usage

### `conversations` - List conversations

```bash
ai-gateway conversations
# hoặc
ai-gateway convs
```

### `show` - Xem chi tiết conversation

```bash
ai-gateway show <conversation-id>
```

### `delete` - Xóa conversation

```bash
ai-gateway delete <conversation-id>
# hoặc
ai-gateway rm <conversation-id>
```

### `export` - Export conversation

```bash
ai-gateway export <conversation-id> <output-path>
```

### `list-models` - List các models có sẵn

```bash
ai-gateway list-models
```

## Examples

### Code Generation

```bash
ai-gateway chat "Write a TypeScript function to calculate fibonacci numbers" \
  --model openai/gpt-4 \
  --temperature 0.3
```

### 🆕 Long Code Review Session với Memory

```bash
# Start review session
ai-gateway interactive --auto-save \
  --model openai/gpt-4 \
  --system "You are an expert code reviewer"

# Review multiple files - AI nhớ tất cả context
> Review this authentication code...
> Now check the database layer...
> Are there any security issues based on what you've seen?

# Sau này quay lại continue
ai-gateway interactive -c conv_review_123
```

### Creative Writing

```bash
ai-gateway chat "Write a short sci-fi story" \
  --model anthropic/claude-3-opus \
  --temperature 1.2 \
  --max-tokens 1000 \
  --stream
```

### 🆕 Learning Session với Token Management

```bash
# Start learning with large context
ai-gateway interactive --auto-save \
  --model anthropic/claude-3-opus \
  --max-context-tokens 50000 \
  --system "You are a patient tutor"

# Check token usage anytime
> tokens
📊 Token Usage:
   Current: 12.5K tokens
   Limit: 200.0K tokens
   Used: 6.3%
```

### Data Analysis Help

```bash
ai-gateway interactive \
  --model openai/gpt-4 \
  --system "You are a data science expert specializing in Python and pandas"
```

### Get JSON for Parsing

```bash
ai-gateway chat "List 5 programming languages" --json > response.json
```

### 🆕 Export Conversations

```bash
# Export important conversation to share
ai-gateway export conv_123456 meeting-notes.md

# Share với team members
```

### Sử dụng trong code TypeScript/JavaScript

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.AI_GATEWAY_API_KEY,
  baseURL: 'https://ai-gateway.vercel.sh/v1'
});

const response = await client.chat.completions.create({
  model: 'deepseek/deepseek-v3.2-exp',
  messages: [
    {
      role: 'user',
      content: 'Why is the sky blue?'
    }
  ]
});

console.log(response.choices[0].message.content);
```

## Environment Variables

- `AI_GATEWAY_API_KEY` (required): API key cho authentication
- `AI_GATEWAY_BASE_URL` (optional): Custom base URL (default: https://ai-gateway.vercel.sh/v1)

## Development

### Build

```bash
npm run build
```

### Run in Development Mode

```bash
npm run dev -- chat "Hello"
```

### Link Locally

```bash
npm link
ai-gateway chat "Test message"
```

## Project Structure

```
ai-gateway-cli/
├── src/
│   ├── index.ts                 # Main CLI file
│   ├── conversation-manager.ts  # Conversation storage management
│   ├── token-counter.ts         # Token counting & optimization
│   ├── types.ts                 # TypeScript interfaces
│   └── example.ts               # Example usage
├── dist/                        # Compiled JavaScript (after build)
├── package.json                 # NPM configuration
├── tsconfig.json                # TypeScript configuration
├── .env.example                 # Environment variables template
├── README.md                    # Main documentation
├── MEMORY_FEATURES.md           # Memory & token features guide
└── QUICKSTART.md               # Quick start guide
```

## 📁 Storage Location

Conversations are saved to: `~/.ai-gateway/conversations/`

Each conversation is a JSON file with full message history and metadata.

## Error Handling

CLI cung cấp error messages rõ ràng cho các vấn đề thường gặp:

- Missing API key
- Network errors
- Invalid model names
- Rate limiting
- Invalid parameters

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

---

**Happy chatting với AI! 🤖🚀**