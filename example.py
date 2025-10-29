#!/usr/bin/env python3
"""
Example usage of AI Gateway - similar to the CLI but as a Python script
This demonstrates the same functionality as the CLI in programmatic form
"""

import os
from openai import OpenAI

# Initialize the client
client = OpenAI(
    api_key=os.getenv('AI_GATEWAY_API_KEY'),
    base_url='https://ai-gateway.vercel.sh/v1'
)

# Make a chat completion request
response = client.chat.completions.create(
    model='deepseek/deepseek-v3.2-exp',
    messages=[
        {
            'role': 'user',
            'content': 'Why is the sky blue?'
        }
    ]
)

# Print the response
print(response.choices[0].message.content)
