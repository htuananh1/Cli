#!/usr/bin/env python3
"""
AI Gateway CLI - A command-line interface for interacting with AI Gateway
"""

import os
import sys
import argparse
import json
from typing import Optional, List, Dict
from openai import OpenAI


class AIGatewayCLI:
    """Main CLI class for AI Gateway interactions"""
    
    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        """
        Initialize the AI Gateway CLI
        
        Args:
            api_key: API key for authentication (defaults to AI_GATEWAY_API_KEY env var)
            base_url: Base URL for the AI Gateway (defaults to https://ai-gateway.vercel.sh/v1)
        """
        self.api_key = api_key or os.getenv('AI_GATEWAY_API_KEY')
        self.base_url = base_url or os.getenv('AI_GATEWAY_BASE_URL', 'https://ai-gateway.vercel.sh/v1')
        
        if not self.api_key:
            print("Error: AI_GATEWAY_API_KEY environment variable not set or API key not provided", file=sys.stderr)
            sys.exit(1)
        
        self.client = OpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )
    
    def chat(self, 
             prompt: str, 
             model: str = 'deepseek/deepseek-v3.2-exp',
             system_prompt: Optional[str] = None,
             temperature: float = 0.7,
             max_tokens: Optional[int] = None,
             stream: bool = False,
             json_output: bool = False) -> None:
        """
        Send a chat completion request
        
        Args:
            prompt: User message/prompt
            model: Model to use for completion
            system_prompt: Optional system prompt
            temperature: Sampling temperature
            max_tokens: Maximum tokens to generate
            stream: Whether to stream the response
            json_output: Whether to output response as JSON
        """
        messages = []
        
        if system_prompt:
            messages.append({
                'role': 'system',
                'content': system_prompt
            })
        
        messages.append({
            'role': 'user',
            'content': prompt
        })
        
        try:
            kwargs = {
                'model': model,
                'messages': messages,
                'temperature': temperature,
                'stream': stream
            }
            
            if max_tokens:
                kwargs['max_tokens'] = max_tokens
            
            response = self.client.chat.completions.create(**kwargs)
            
            if stream:
                print("Response: ", end='', flush=True)
                full_response = ""
                for chunk in response:
                    if chunk.choices[0].delta.content:
                        content = chunk.choices[0].delta.content
                        full_response += content
                        print(content, end='', flush=True)
                print()  # New line after streaming
                
                if json_output:
                    print("\nJSON Output:")
                    print(json.dumps({
                        'model': model,
                        'content': full_response,
                        'stream': True
                    }, indent=2))
            else:
                content = response.choices[0].message.content
                
                if json_output:
                    output = {
                        'model': response.model,
                        'content': content,
                        'usage': {
                            'prompt_tokens': response.usage.prompt_tokens,
                            'completion_tokens': response.usage.completion_tokens,
                            'total_tokens': response.usage.total_tokens
                        },
                        'finish_reason': response.choices[0].finish_reason
                    }
                    print(json.dumps(output, indent=2))
                else:
                    print(f"Response: {content}")
                    print(f"\nModel: {response.model}")
                    print(f"Tokens used: {response.usage.total_tokens} (prompt: {response.usage.prompt_tokens}, completion: {response.usage.completion_tokens})")
        
        except Exception as e:
            print(f"Error: {str(e)}", file=sys.stderr)
            sys.exit(1)
    
    def interactive(self, 
                   model: str = 'deepseek/deepseek-v3.2-exp',
                   system_prompt: Optional[str] = None,
                   temperature: float = 0.7) -> None:
        """
        Start an interactive chat session
        
        Args:
            model: Model to use for completion
            system_prompt: Optional system prompt
            temperature: Sampling temperature
        """
        print(f"AI Gateway Interactive Chat (Model: {model})")
        print("Type 'exit' or 'quit' to end the session, 'clear' to clear history\n")
        
        messages = []
        if system_prompt:
            messages.append({
                'role': 'system',
                'content': system_prompt
            })
        
        while True:
            try:
                user_input = input("You: ").strip()
                
                if not user_input:
                    continue
                
                if user_input.lower() in ['exit', 'quit']:
                    print("Goodbye!")
                    break
                
                if user_input.lower() == 'clear':
                    messages = []
                    if system_prompt:
                        messages.append({
                            'role': 'system',
                            'content': system_prompt
                        })
                    print("Chat history cleared.\n")
                    continue
                
                messages.append({
                    'role': 'user',
                    'content': user_input
                })
                
                response = self.client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    stream=True
                )
                
                print("Assistant: ", end='', flush=True)
                full_response = ""
                for chunk in response:
                    if chunk.choices[0].delta.content:
                        content = chunk.choices[0].delta.content
                        full_response += content
                        print(content, end='', flush=True)
                print("\n")
                
                messages.append({
                    'role': 'assistant',
                    'content': full_response
                })
                
            except KeyboardInterrupt:
                print("\n\nGoodbye!")
                break
            except EOFError:
                print("\nGoodbye!")
                break
            except Exception as e:
                print(f"\nError: {str(e)}", file=sys.stderr)
    
    def list_models(self) -> None:
        """List available models"""
        print("Popular AI Gateway Models:")
        models = [
            "deepseek/deepseek-v3.2-exp",
            "openai/gpt-4-turbo",
            "openai/gpt-4",
            "openai/gpt-3.5-turbo",
            "anthropic/claude-3-opus",
            "anthropic/claude-3-sonnet",
            "anthropic/claude-3-haiku",
            "google/gemini-pro",
            "meta-llama/llama-3-70b",
            "mistralai/mixtral-8x7b"
        ]
        
        for model in models:
            print(f"  - {model}")


def main():
    """Main entry point for the CLI"""
    parser = argparse.ArgumentParser(
        description='AI Gateway CLI - Interact with AI models through the AI Gateway',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Simple chat
  %(prog)s chat "Why is the sky blue?"
  
  # Use a specific model
  %(prog)s chat "Explain quantum computing" --model openai/gpt-4
  
  # Add a system prompt
  %(prog)s chat "Write a poem" --system "You are a creative poet"
  
  # Stream the response
  %(prog)s chat "Tell me a story" --stream
  
  # Get JSON output
  %(prog)s chat "Hello" --json
  
  # Interactive mode
  %(prog)s interactive
  
  # List available models
  %(prog)s list-models

Environment Variables:
  AI_GATEWAY_API_KEY    API key for authentication (required)
  AI_GATEWAY_BASE_URL   Base URL for the gateway (optional, defaults to https://ai-gateway.vercel.sh/v1)
        """
    )
    
    parser.add_argument('--api-key', type=str, help='API key (overrides AI_GATEWAY_API_KEY env var)')
    parser.add_argument('--base-url', type=str, help='Base URL for AI Gateway')
    
    subparsers = parser.add_subparsers(dest='command', help='Available commands')
    
    # Chat command
    chat_parser = subparsers.add_parser('chat', help='Send a single chat message')
    chat_parser.add_argument('prompt', type=str, help='The message/prompt to send')
    chat_parser.add_argument('--model', '-m', type=str, default='deepseek/deepseek-v3.2-exp',
                           help='Model to use (default: deepseek/deepseek-v3.2-exp)')
    chat_parser.add_argument('--system', '-s', type=str, help='System prompt')
    chat_parser.add_argument('--temperature', '-t', type=float, default=0.7,
                           help='Temperature for sampling (default: 0.7)')
    chat_parser.add_argument('--max-tokens', type=int, help='Maximum tokens to generate')
    chat_parser.add_argument('--stream', action='store_true', help='Stream the response')
    chat_parser.add_argument('--json', action='store_true', help='Output response as JSON')
    
    # Interactive command
    interactive_parser = subparsers.add_parser('interactive', help='Start an interactive chat session')
    interactive_parser.add_argument('--model', '-m', type=str, default='deepseek/deepseek-v3.2-exp',
                                   help='Model to use (default: deepseek/deepseek-v3.2-exp)')
    interactive_parser.add_argument('--system', '-s', type=str, help='System prompt')
    interactive_parser.add_argument('--temperature', '-t', type=float, default=0.7,
                                   help='Temperature for sampling (default: 0.7)')
    
    # List models command
    subparsers.add_parser('list-models', help='List available models')
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    # Initialize CLI
    cli = AIGatewayCLI(api_key=args.api_key, base_url=args.base_url)
    
    # Execute command
    if args.command == 'chat':
        cli.chat(
            prompt=args.prompt,
            model=args.model,
            system_prompt=args.system,
            temperature=args.temperature,
            max_tokens=args.max_tokens,
            stream=args.stream,
            json_output=args.json
        )
    elif args.command == 'interactive':
        cli.interactive(
            model=args.model,
            system_prompt=args.system,
            temperature=args.temperature
        )
    elif args.command == 'list-models':
        cli.list_models()


if __name__ == '__main__':
    main()
