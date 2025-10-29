# Changelog

## [2.0.0] - 2025-10-29

### 🎉 Major Release - Memory & Token Management

#### Added
- 🧠 **Conversation Memory System**
  - Persistent storage of conversations to `~/.ai-gateway/conversations/`
  - Auto-save mode for interactive sessions
  - Continue conversations across sessions with conversation IDs
  
- 📊 **Token Counting & Management**
  - Real-time token counting using tiktoken
  - Display token usage in interactive mode with `tokens` command
  - Automatic token limit detection for all models
  - Smart context trimming when approaching limits
  
- 📚 **Conversation Management Commands**
  - `conversations` / `convs` - List all saved conversations
  - `show <id>` - Display full conversation history
  - `delete <id>` / `rm <id>` - Remove conversations
  - `export <id> <path>` - Export conversations to Markdown
  
- 🔧 **New CLI Options**
  - `--conversation-id` / `-c` - Continue from existing conversation
  - `--max-context-tokens` - Set maximum context window size
  - `--auto-save` - Automatically save interactive sessions
  
- 📖 **Enhanced Documentation**
  - `MEMORY_FEATURES.md` - Comprehensive guide to new features
  - `CHANGELOG.md` - Version history
  - Updated README with v2.0 features

#### Changed
- Upgraded to version 2.0.0
- Enhanced interactive mode with save/tokens commands
- Improved help messages and command descriptions
- Better error handling for token limits

#### Technical
- Added `tiktoken` for accurate token counting
- Added `fs-extra` for file system operations
- New `ConversationManager` class for storage management
- New `TokenCounter` class for token operations
- TypeScript interfaces in `types.ts`

### Dependencies
- openai: ^4.0.0
- commander: ^11.0.0
- chalk: ^4.1.2
- ora: ^5.4.1
- dotenv: ^16.0.0
- tiktoken: ^1.0.0 (NEW)
- fs-extra: ^11.0.0 (NEW)

## [1.0.0] - 2025-10-29

### Initial Release

#### Features
- Basic chat command
- Interactive mode
- Streaming responses
- Multiple model support
- System prompts
- JSON output
- Temperature control
- Token limits
- Model listing

#### Models Supported
- DeepSeek
- OpenAI GPT-4 / GPT-3.5
- Anthropic Claude 3
- Google Gemini
- Meta Llama
- Mistral

---

For detailed usage of new features, see [MEMORY_FEATURES.md](MEMORY_FEATURES.md)
