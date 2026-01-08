import React from 'react';
import { Box, Text } from 'ink';

const FileTree = () => {
  return (
    <Box flexDirection="column">
      <Text color="green">Files (Mock)</Text>
      <Text>  src/</Text>
      <Text>    core/</Text>
      <Text>    ui/</Text>
    </Box>
  );
};

export default FileTree;
