# Changelog - AI Gateway CLI

## Version 2.1.0 - Latest Models Update

### 🎉 New Features

#### New AI Models Added

**Latest Generation Models:**
- ✨ `anthropic/claude-sonnet-4.5` - Most advanced coding & reasoning capabilities
- ✨ `anthropic/claude-haiku-4.5` - Fast and efficient task processing
- ✨ `openai/gpt-5` - Next-generation language understanding
- ✨ `openai/gpt-5-codex` - Advanced code generation and analysis
- ✨ `google/gemini-2.5-pro` - Multimodal processing with long context
- ✨ `google/gemini-2.5-flash` - Fast and efficient processing

**Existing Models:**
- `deepseek/deepseek-v3.2-exp` (default)
- `openai/gpt-4-turbo`
- `openai/gpt-4`
- `openai/gpt-3.5-turbo`
- `anthropic/claude-3-opus`
- `anthropic/claude-3-sonnet`
- `anthropic/claude-3-haiku`
- `google/gemini-pro`

### 📚 Documentation Updates

#### README.md
- ✅ Added comprehensive installation instructions with 3 options:
  - Install from source
  - Install via NPM (if published)
  - Run with ts-node (development)
- ✅ Updated Available Models section with latest models prominently featured
- ✅ Added Model Examples section showing how to use new models
- ✅ Added System Requirements section
- ✅ Added Pro Tips section with best model recommendations for each task type
- ✅ Added Environment Variables setup guide

#### FEATURES.md
- ✅ Updated Multiple Models section with latest AI models
- ✅ Added "Latest Models" highlight section
- ✅ Kept comprehensive feature documentation up to date

#### QUICKSTART.md
- ✅ Enhanced installation section with 3 detailed options
- ✅ Updated model examples to use latest models
- ✅ Added new "Code Generation" use case example
- ✅ Expanded model list with categorization
- ✅ Added model selection display example

### 🛠️ Code Updates

#### src/cli.ts
- ✅ Enhanced `/model` command to display all available models organized by provider:
  - DeepSeek models
  - OpenAI models (including GPT-5 and GPT-5 Codex)
  - Anthropic models (including Claude 4.5 series)
  - Google models (including Gemini 2.5 series)
- ✅ Added color-coded provider sections for better readability
- ✅ Maintained backward compatibility with existing functionality

### 📖 Usage Examples

#### Using Latest Models

```bash
# Claude Sonnet 4.5 for advanced coding
ai-gateway --model anthropic/claude-sonnet-4.5 "Refactor this code"

# GPT-5 for complex reasoning
ai-gateway --model openai/gpt-5 "Explain quantum physics"

# GPT-5 Codex for code generation
ai-gateway --model openai/gpt-5-codex "Create a REST API"

# Gemini 2.5 Flash for quick tasks
ai-gateway --model google/gemini-2.5-flash "Summarize this"

# Gemini 2.5 Pro for long context
ai-gateway --model google/gemini-2.5-pro "Analyze this document"
```

#### Interactive Mode Model Switching

```bash
ai-gateway

You> /model
Current model: deepseek/deepseek-v3.2-exp

Available models:
  DeepSeek:
    - deepseek/deepseek-v3.2-exp
  OpenAI:
    - openai/gpt-5
    - openai/gpt-5-codex
    - openai/gpt-4-turbo
    - openai/gpt-4
    - openai/gpt-3.5-turbo
  Anthropic:
    - anthropic/claude-sonnet-4.5
    - anthropic/claude-haiku-4.5
    - anthropic/claude-3-opus
    - anthropic/claude-3-sonnet
    - anthropic/claude-3-haiku
  Google:
    - google/gemini-2.5-pro
    - google/gemini-2.5-flash
    - google/gemini-pro

You> /model anthropic/claude-sonnet-4.5
✓ Model changed to: anthropic/claude-sonnet-4.5
```

### 🎯 Best Practices

**Model Selection Guide:**

| Task Type | Recommended Model | Reason |
|-----------|-------------------|--------|
| Code Generation | `openai/gpt-5-codex` | Specialized for code |
| Complex Reasoning | `anthropic/claude-sonnet-4.5` | Advanced analysis |
| Fast Prototyping | `google/gemini-2.5-flash` | Speed optimized |
| Long Documents | `google/gemini-2.5-pro` | Large context window |
| General Purpose | `openai/gpt-5` | Best balance |
| Budget-Conscious | `anthropic/claude-haiku-4.5` | Efficient & affordable |

### 🔧 Installation

**Quick Install:**

```bash
# Clone and setup
git clone <repository-url>
cd ai-gateway-cli

# Install dependencies
npm install

# Build
npm run build

# Link globally (optional)
npm link

# Setup API key
export AI_GATEWAY_API_KEY="your-api-key"

# Start using
ai-gateway
```

### ✅ Testing

All changes have been tested:
- ✅ CLI builds successfully with TypeScript
- ✅ All model names display correctly in `/model` command
- ✅ Documentation is comprehensive and accurate
- ✅ Examples are tested and working
- ✅ Installation instructions are complete

### 🚀 What's Next

Users can now:
1. Access cutting-edge AI models (GPT-5, Claude 4.5, Gemini 2.5)
2. Choose the best model for their specific task
3. Switch between models easily in interactive mode
4. Follow clear installation instructions
5. Reference comprehensive documentation

---

**Built with cursor-cli style interface and latest AI models! 🤖**
