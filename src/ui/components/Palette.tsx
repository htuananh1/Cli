import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import TextInput from 'ink-text-input';
import { useInput } from 'ink';

interface PaletteProps {
  onSelect: (item: string) => void;
  onClose: () => void;
  mode: 'file' | 'command';
}

const Palette: React.FC<PaletteProps> = ({ onSelect, onClose, mode }) => {
  const [query, setQuery] = useState('');

  // Mock results for now
  const results = mode === 'file'
    ? ['src/index.ts', 'src/ui/App.tsx', 'package.json']
    : ['Run Tests', 'Lint', 'Build', 'Doctor'];

  const filtered = results.filter(r => r.toLowerCase().includes(query.toLowerCase()));
  const [selectedIndex, setSelectedIndex] = useState(0);

  useInput((input, key) => {
    if (key.escape) {
      onClose();
    }
    if (key.upArrow) {
      setSelectedIndex(prev => Math.max(0, prev - 1));
    }
    if (key.downArrow) {
      setSelectedIndex(prev => Math.min(filtered.length - 1, prev + 1));
    }
    if (key.return) {
      if (filtered[selectedIndex]) {
        onSelect(filtered[selectedIndex]);
      }
    }
  });

  return (
    <Box flexDirection="column" borderStyle="double" borderColor="cyan" width={60} position="absolute">
      <Box paddingX={1} borderStyle="single" borderColor="gray">
        <Text color="cyan">{mode === 'file' ? 'Go to File:' : 'Run Command:'} </Text>
        <TextInput value={query} onChange={setQuery} focus={true} />
      </Box>
      <Box flexDirection="column" paddingX={1} height={10}>
        {filtered.map((item, i) => (
          <Text key={item} color={i === selectedIndex ? 'cyan' : 'white'} backgroundColor={i === selectedIndex ? 'gray' : undefined}>
            {i === selectedIndex ? '> ' : '  '}{item}
          </Text>
        ))}
      </Box>
    </Box>
  );
};

export default Palette;
