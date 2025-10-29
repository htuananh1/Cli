# 🧠 Memory & Token Management Features

## Tính năng mới trong v2.0

CLI đã được nâng cấp với khả năng **nhớ conversations** và **quản lý tokens** hiệu quả cho số lượng lớn!

## ✨ Tính năng chính

### 1. 💾 Conversation Storage (Lưu trữ hội thoại)

Tất cả conversations được lưu tự động vào `~/.ai-gateway/conversations/`

```bash
# Tạo conversation mới với auto-save
ai-gateway interactive --auto-save

# Tiếp tục conversation cũ
ai-gateway interactive --conversation-id conv_123456

# Chat đơn với conversation ID
ai-gateway chat "Hello" --conversation-id conv_123456
```

### 2. 📊 Token Counting & Management

CLI tự động đếm và hiển thị token usage:

```bash
# Xem token usage trong interactive mode
ai-gateway interactive
> tokens
📊 Token Usage:
   Current: 1.2K tokens
   Limit: 32.8K tokens
   Used: 3.7%
   Messages: 15
```

### 3. 🔄 Auto Context Window Management

Tự động quản lý context window khi token đạt giới hạn:

```bash
# Set max context tokens
ai-gateway interactive --max-context-tokens 10000

# CLI tự động trim old messages khi vượt limit
⚠️  Token limit reached (11.2K tokens). Trimming old messages...
```

### 4. 📚 Conversation Management Commands

#### List tất cả conversations

```bash
ai-gateway conversations
# hoặc
ai-gateway convs
```

Output:
```
📚 Saved Conversations (3):

  Chat 10/29/2025, 10:30:00 AM
    ID: conv_1730180400_abc123
    Model: deepseek/deepseek-v3.2-exp | Messages: 15 | Tokens: 2.5K tokens
    Updated: 10/29/2025, 10:45:32 AM

  Code Review Session
    ID: conv_1730179800_xyz789
    Model: openai/gpt-4 | Messages: 8 | Tokens: 1.8K tokens
    Updated: 10/29/2025, 10:20:15 AM
```

#### Xem chi tiết conversation

```bash
ai-gateway show conv_123456
```

Output hiển thị toàn bộ lịch sử chat với timestamps và token counts.

#### Delete conversation

```bash
ai-gateway delete conv_123456
# hoặc
ai-gateway rm conv_123456
```

#### Export conversation ra Markdown

```bash
ai-gateway export conv_123456 conversation.md
```

Tạo file markdown với format đẹp, dễ đọc và chia sẻ.

## 🚀 Use Cases

### 1. Long-running Conversations

```bash
# Bắt đầu session dài với auto-save
ai-gateway interactive --auto-save --model openai/gpt-4

# Work nhiều giờ, tất cả được lưu tự động
# Khi nào cần, tiếp tục với conversation ID
ai-gateway interactive -c conv_123456
```

### 2. Code Review với Context

```bash
# Chat với system prompt về code review
ai-gateway interactive --auto-save \
  --system "You are an expert code reviewer" \
  --model openai/gpt-4

# Review nhiều files, AI nhớ hết context
```

### 3. Learning Sessions

```bash
# Học một chủ đề phức tạp
ai-gateway interactive --auto-save \
  --system "You are a patient tutor explaining advanced concepts" \
  --max-context-tokens 20000

# AI nhớ tất cả những gì đã học
```

### 4. Brainstorming Projects

```bash
# Brainstorm ideas cho project
ai-gateway interactive --auto-save \
  --temperature 0.9 \
  --model anthropic/claude-3-opus

# Export ra file để share với team
ai-gateway export conv_123456 brainstorm-notes.md
```

## 📖 Chi tiết Commands

### Interactive Mode Commands

Trong interactive mode, bạn có các lệnh đặc biệt:

- `exit` / `quit` - Thoát session
- `clear` - Xóa history (không xóa saved conversation)
- `save` - Save conversation nếu chưa auto-save
- `tokens` - Xem token usage hiện tại

### Token Limits per Model

CLI tự động biết token limit của từng model:

| Model | Context Window |
|-------|---------------|
| GPT-4 Turbo | 128K tokens |
| Claude 3 Opus/Sonnet | 200K tokens |
| GPT-4 | 8K tokens |
| DeepSeek v3.2 | 32K tokens |
| GPT-3.5 Turbo | 4K tokens |

### Auto-trim Logic

Khi tokens vượt limit:
1. System message luôn được giữ
2. Tin nhắn cũ nhất bị trim trước
3. Tin nhắn gần nhất được ưu tiên giữ
4. Đảm bảo luôn có đủ space cho response

## 💡 Best Practices

### 1. Đặt tên conversations có ý nghĩa

```bash
# Thay vì dùng auto-generated name
# Trong interactive mode, gõ:
> save
💾 Saved conversation: Chat 10/29/2025, 10:30:00 AM
   ID: conv_123456

# Có thể rename bằng cách edit file:
# ~/.ai-gateway/conversations/conv_123456.json
```

### 2. Monitor token usage

```bash
# Check tokens thường xuyên trong long sessions
> tokens
```

### 3. Export important conversations

```bash
# Backup conversations quan trọng
ai-gateway export conv_123456 backup.md
```

### 4. Set context limits cho specific use cases

```bash
# Cho quick questions - low context
ai-gateway interactive --max-context-tokens 2000

# Cho deep analysis - high context
ai-gateway interactive --max-context-tokens 50000 \
  --model anthropic/claude-3-opus
```

### 5. Use conversation ID cho multi-turn tasks

```bash
# Day 1: Start work
ai-gateway interactive --auto-save
# ID: conv_day1_xyz

# Day 2: Continue
ai-gateway chat "What did we discuss yesterday?" -c conv_day1_xyz

# Day 3: Keep going
ai-gateway interactive -c conv_day1_xyz
```

## 🔧 Advanced Features

### Token Counter API

Nếu dùng programmatically:

```typescript
import { TokenCounter } from './token-counter';

const counter = new TokenCounter('gpt-4');

// Count tokens in text
const tokens = counter.countTokens('Hello, world!');

// Count message tokens
const msgTokens = counter.countMessageTokens({
  role: 'user',
  content: 'Hello!',
});

// Estimate available tokens
const estimate = counter.estimateResponseTokens(messages);
console.log(`Used: ${estimate.used}, Available: ${estimate.available}`);
```

### Conversation Manager API

```typescript
import { ConversationManager } from './conversation-manager';

const manager = new ConversationManager();

// Create conversation
const conv = await manager.create('My Chat', 'gpt-4', 'You are helpful');

// Add messages
await manager.addMessage(conv.id, {
  role: 'user',
  content: 'Hello!',
  timestamp: Date.now(),
});

// Load conversation
const loaded = await manager.load(conv.id);

// Export
await manager.export(conv.id, 'output.md');
```

## 📈 Performance

- Conversations được lưu dạng JSON, load/save cực nhanh
- Token counting dùng tiktoken (official OpenAI library)
- Auto-trim chỉ tính toán khi cần thiết
- Storage location: `~/.ai-gateway/conversations/`

## 🎯 Tips & Tricks

### 1. Combine với shell scripts

```bash
#!/bin/bash
# daily-standup.sh

CONV_ID="conv_standup_2025"

# Check yesterday's work
ai-gateway chat "Summarize what we did yesterday" -c $CONV_ID

# Plan today
ai-gateway interactive -c $CONV_ID
```

### 2. Use system prompts effectively

```bash
# For coding
ai-gateway interactive --auto-save \
  --system "You are a senior developer. Always provide code examples and explain trade-offs."

# For writing
ai-gateway interactive --auto-save \
  --system "You are a professional editor. Focus on clarity and conciseness."
```

### 3. Different models for different stages

```bash
# Brainstorm with creative model
ai-gateway interactive --auto-save -m anthropic/claude-3-opus -t 0.9

# Get conversation ID, then refine with precise model
ai-gateway chat "Refine the ideas into action items" \
  -c conv_123456 -m openai/gpt-4 -t 0.3
```

## 🐛 Troubleshooting

### "Token limit exceeded" errors

```bash
# Reduce max-context-tokens
ai-gateway interactive --max-context-tokens 10000

# Or start fresh
ai-gateway interactive --auto-save
```

### Conversations not saving

```bash
# Check directory exists and writable
ls -la ~/.ai-gateway/conversations/

# Create if missing
mkdir -p ~/.ai-gateway/conversations
```

### Token counting seems off

Token counting dùng tiktoken library - có thể khác một chút so với API thực tế, nhưng rất gần đúng (>95% accuracy).

---

**Với những tính năng này, bạn có thể work với AI trong sessions dài, phức tạp mà không lo mất context! 🚀🧠**
