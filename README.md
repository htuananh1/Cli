# AI Gateway CLI

A powerful command-line interface for interacting with AI models through the AI Gateway service. This CLI provides an easy way to chat with various AI models including DeepSeek, OpenAI GPT, Claude, Gemini, and more.

## Features

- 🚀 **Simple Chat Interface**: Send single prompts or have interactive conversations
- 🔄 **Streaming Support**: Real-time streaming responses
- 🎯 **Multiple Models**: Support for various AI models (DeepSeek, GPT-4, Claude, etc.)
- 💾 **JSON Output**: Get structured JSON responses for programmatic use
- 🎨 **System Prompts**: Customize AI behavior with system prompts
- ⚙️ **Configurable**: Control temperature, max tokens, and more
- 🔐 **Secure**: Uses environment variables for API key management

## Installation

### Quick Install

```bash
pip install -r requirements.txt
chmod +x ai_gateway_cli.py
```

### Install as a Command

```bash
pip install -e .
```

This will install the `ai-gateway` command globally.

## Configuration

Set your API key as an environment variable:

```bash
export AI_GATEWAY_API_KEY="your-api-key-here"
```

Optionally, you can set a custom base URL:

```bash
export AI_GATEWAY_BASE_URL="https://ai-gateway.vercel.sh/v1"
```

## Usage

### Basic Chat

Send a single message:

```bash
python ai_gateway_cli.py chat "Why is the sky blue?"
```

Or if installed:

```bash
ai-gateway chat "Why is the sky blue?"
```

### Using Different Models

```bash
python ai_gateway_cli.py chat "Explain quantum computing" --model openai/gpt-4
```

### With System Prompt

```bash
python ai_gateway_cli.py chat "Write a poem about autumn" --system "You are a creative poet who writes in haiku style"
```

### Streaming Responses

Get real-time streaming output:

```bash
python ai_gateway_cli.py chat "Tell me a story" --stream
```

### JSON Output

Get structured JSON response:

```bash
python ai_gateway_cli.py chat "Hello, AI!" --json
```

### Interactive Mode

Start an interactive chat session:

```bash
python ai_gateway_cli.py interactive
```

In interactive mode:
- Type your messages and get responses
- Type `clear` to reset conversation history
- Type `exit` or `quit` to end the session
- Use Ctrl+C to quit

### Interactive with Custom Model

```bash
python ai_gateway_cli.py interactive --model anthropic/claude-3-sonnet
```

### Advanced Options

```bash
python ai_gateway_cli.py chat "Explain AI" \
  --model openai/gpt-4 \
  --temperature 0.9 \
  --max-tokens 500 \
  --system "You are a helpful AI assistant" \
  --stream
```

### List Available Models

```bash
python ai_gateway_cli.py list-models
```

## Available Models

The CLI supports various models including:

- **DeepSeek**: `deepseek/deepseek-v3.2-exp`
- **OpenAI**: `openai/gpt-4-turbo`, `openai/gpt-4`, `openai/gpt-3.5-turbo`
- **Anthropic**: `anthropic/claude-3-opus`, `anthropic/claude-3-sonnet`, `anthropic/claude-3-haiku`
- **Google**: `google/gemini-pro`
- **Meta**: `meta-llama/llama-3-70b`
- **Mistral**: `mistralai/mixtral-8x7b`

## Command Reference

### `chat` - Send a single message

```bash
python ai_gateway_cli.py chat <prompt> [options]
```

**Options:**
- `--model, -m`: Model to use (default: deepseek/deepseek-v3.2-exp)
- `--system, -s`: System prompt to set context
- `--temperature, -t`: Sampling temperature 0-2 (default: 0.7)
- `--max-tokens`: Maximum tokens to generate
- `--stream`: Stream the response in real-time
- `--json`: Output response as JSON

### `interactive` - Interactive chat session

```bash
python ai_gateway_cli.py interactive [options]
```

**Options:**
- `--model, -m`: Model to use (default: deepseek/deepseek-v3.2-exp)
- `--system, -s`: System prompt to set context
- `--temperature, -t`: Sampling temperature 0-2 (default: 0.7)

### `list-models` - List available models

```bash
python ai_gateway_cli.py list-models
```

## Examples

### Code Generation

```bash
python ai_gateway_cli.py chat "Write a Python function to calculate fibonacci numbers" \
  --model openai/gpt-4 \
  --temperature 0.3
```

### Creative Writing

```bash
python ai_gateway_cli.py chat "Write a short sci-fi story" \
  --model anthropic/claude-3-opus \
  --temperature 1.2 \
  --max-tokens 1000 \
  --stream
```

### Data Analysis Help

```bash
python ai_gateway_cli.py interactive \
  --model openai/gpt-4 \
  --system "You are a data science expert specializing in Python and pandas"
```

### Get JSON for Parsing

```bash
python ai_gateway_cli.py chat "List 5 programming languages" \
  --json > response.json
```

## Environment Variables

- `AI_GATEWAY_API_KEY` (required): Your API key for authentication
- `AI_GATEWAY_BASE_URL` (optional): Custom base URL (default: https://ai-gateway.vercel.sh/v1)

## Error Handling

The CLI provides clear error messages for common issues:

- Missing API key
- Network errors
- Invalid model names
- Rate limiting

## Development

### Running Tests

```bash
python -m pytest tests/
```

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

---

**Happy chatting with AI! 🤖**