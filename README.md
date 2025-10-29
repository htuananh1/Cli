# AI Gateway CLI

A powerful command-line interface for interacting with AI models through the AI Gateway service. Built with TypeScript and Node.js, this CLI provides an easy way to chat with various AI models including DeepSeek, OpenAI GPT, Claude, Gemini, and more.

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

### Interactive Mode

Bắt đầu cuộc trò chuyện tương tác:

```bash
ai-gateway interactive
```

Trong interactive mode:
- Gõ tin nhắn và nhận response
- Gõ `clear` để xóa lịch sử hội thoại
- Gõ `exit` hoặc `quit` để kết thúc
- Nhấn Ctrl+C để thoát

### Interactive với Custom Model

```bash
ai-gateway interactive --model anthropic/claude-3-sonnet
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

CLI hỗ trợ nhiều models:

- **DeepSeek**: `deepseek/deepseek-v3.2-exp`
- **OpenAI**: `openai/gpt-4-turbo`, `openai/gpt-4`, `openai/gpt-3.5-turbo`
- **Anthropic**: `anthropic/claude-3-opus`, `anthropic/claude-3-sonnet`, `anthropic/claude-3-haiku`
- **Google**: `google/gemini-pro`
- **Meta**: `meta-llama/llama-3-70b`
- **Mistral**: `mistralai/mixtral-8x7b`

## Command Reference

### `chat` - Gửi một tin nhắn

```bash
ai-gateway chat <prompt> [options]
```

**Options:**
- `-m, --model <model>`: Model sử dụng (default: deepseek/deepseek-v3.2-exp)
- `-s, --system <prompt>`: System prompt để set context
- `-t, --temperature <number>`: Temperature 0-2 (default: 0.7)
- `--max-tokens <number>`: Số tokens tối đa
- `--stream`: Stream response real-time
- `--json`: Output dạng JSON

### `interactive` - Interactive chat session

```bash
ai-gateway interactive [options]
```

**Options:**
- `-m, --model <model>`: Model sử dụng (default: deepseek/deepseek-v3.2-exp)
- `-s, --system <prompt>`: System prompt để set context
- `-t, --temperature <number>`: Temperature 0-2 (default: 0.7)

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

### Creative Writing

```bash
ai-gateway chat "Write a short sci-fi story" \
  --model anthropic/claude-3-opus \
  --temperature 1.2 \
  --max-tokens 1000 \
  --stream
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
│   ├── index.ts         # Main CLI file
│   └── example.ts       # Example usage
├── dist/                # Compiled JavaScript (after build)
├── package.json         # NPM configuration
├── tsconfig.json        # TypeScript configuration
├── .env.example         # Environment variables template
└── README.md           # Documentation
```

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