import React, { useState } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { ChatMessage } from '../types.js';
import { megallmProvider } from '../../providers/megallm.js';

interface ChatProps {
    onNewMessage: (msg: ChatMessage) => void;
}

const Chat: React.FC<ChatProps> = ({ onNewMessage }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: 'Hello! How can I help you?', timestamp: Date.now() }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (value: string) => {
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: value, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
        const response = await megallmProvider.sendMessage([...messages, userMsg]);
        const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: response, timestamp: Date.now() };
        setMessages(prev => [...prev, aiMsg]);
        onNewMessage(aiMsg);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Box flexDirection="column" height="100%">
      <Box flexGrow={1} flexDirection="column" borderStyle="single" borderColor="gray">
        {messages.map(msg => (
          <Box key={msg.id} paddingX={1} flexDirection="column">
            <Text color={msg.role === 'user' ? 'blue' : 'green'} bold>
              {msg.role === 'user' ? 'You' : 'AI'}:
            </Text>
            <Text>{msg.content}</Text>
          </Box>
        ))}
        {isLoading && <Text color="gray">Thinking...</Text>}
      </Box>
      <Box borderStyle="single" borderColor="gray">
        <Text> {'>'} </Text>
        <TextInput value={input} onChange={setInput} onSubmit={handleSubmit} />
      </Box>
    </Box>
  );
};

export default Chat;
