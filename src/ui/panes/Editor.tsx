import React from 'react';
import { Box, Text } from 'ink';

interface EditorProps {
  content?: string;
  filename?: string;
}

const Editor: React.FC<EditorProps> = ({ content, filename }) => {
  return (
    <Box flexDirection="column" height="100%" width="100%">
      <Box borderStyle="single" borderColor="gray" marginBottom={0}>
        <Text>{filename || 'No file selected'}</Text>
      </Box>
      <Box flexGrow={1} borderStyle="single" borderColor="gray">
        <Text>{content || ''}</Text>
      </Box>
    </Box>
  );
};

export default Editor;
