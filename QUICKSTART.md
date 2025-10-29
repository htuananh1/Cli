# Quick Start Guide - AI Gateway CLI

## 🚀 Bắt đầu nhanh

### 1. Cài đặt

```bash
# Clone repository
git clone <your-repo-url>
cd ai-gateway-cli

# Cài đặt dependencies
npm install

# Build project
npm run build

# Link để sử dụng globally
npm link
```

### 2. Cấu hình API Key

```bash
# Set environment variable
export AI_GATEWAY_API_KEY="your-api-key-here"

# Hoặc tạo file .env
cp .env.example .env
# Sau đó edit .env và thêm API key của bạn
```

### 3. Sử dụng cơ bản

#### Chat đơn giản

```bash
ai-gateway chat "Why is the sky blue?"
```

#### Chat với streaming (real-time response)

```bash
ai-gateway chat "Tell me a story" --stream
```

#### Sử dụng model khác

```bash
ai-gateway chat "Explain AI" --model openai/gpt-4
```

#### Interactive mode

```bash
ai-gateway interactive
```

#### Xem danh sách models

```bash
ai-gateway list-models
```

### 4. Ví dụ nâng cao

#### Với system prompt

```bash
ai-gateway chat "Write a poem" \
  --system "You are a creative poet" \
  --temperature 0.9
```

#### Lấy JSON output

```bash
ai-gateway chat "List 5 colors" --json > output.json
```

#### Interactive với custom settings

```bash
ai-gateway interactive \
  --model anthropic/claude-3-sonnet \
  --system "You are a helpful coding assistant" \
  --temperature 0.5
```

## 📝 Sử dụng trong code

### TypeScript/JavaScript

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

### Với streaming

```typescript
const stream = await client.chat.completions.create({
  model: 'deepseek/deepseek-v3.2-exp',
  messages: [{ role: 'user', content: 'Tell me a story' }],
  stream: true,
});

for await (const chunk of stream) {
  process.stdout.write(chunk.choices[0]?.delta?.content || '');
}
```

## 🎯 Tips & Tricks

### 1. Alias để gõ nhanh hơn

```bash
# Thêm vào ~/.bashrc hoặc ~/.zshrc
alias aig="ai-gateway"
alias aigc="ai-gateway chat"
alias aigi="ai-gateway interactive"

# Sau đó sử dụng:
aigc "Hello AI!"
aigi
```

### 2. Default model

Bạn có thể set model mặc định bằng alias:

```bash
alias aigc4="ai-gateway chat --model openai/gpt-4"
aigc4 "Complex question here"
```

### 3. Pipe output

```bash
# Lưu vào file
ai-gateway chat "Write a TODO list" > todo.txt

# Combine với các tools khác
ai-gateway chat "Generate JSON data" --json | jq '.content'
```

### 4. Multiple API keys

```bash
# Dev environment
export AI_GATEWAY_API_KEY="dev-key"

# Production environment
AI_GATEWAY_API_KEY="prod-key" ai-gateway chat "Test"
```

## 🔧 Development

### Run without building

```bash
npm run dev -- chat "Hello"
```

### Watch mode (rebuild on changes)

```bash
# Terminal 1: Watch TypeScript
npx tsc --watch

# Terminal 2: Test commands
node dist/index.js chat "Test"
```

## ❓ Troubleshooting

### "AI_GATEWAY_API_KEY not set"

```bash
# Check if key is set
echo $AI_GATEWAY_API_KEY

# Set it
export AI_GATEWAY_API_KEY="your-key"
```

### "command not found: ai-gateway"

```bash
# Re-link the package
cd /path/to/ai-gateway-cli
npm link
```

### TypeScript errors

```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

## 📚 More Resources

- [Full Documentation](README.md)
- [Example Code](src/example.ts)
- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)

---

**Chúc bạn code vui vẻ! 🎉**
