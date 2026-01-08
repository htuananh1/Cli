import React from 'react';
import { Box, Text } from 'ink';
import { ParsedPatch } from '../../core/patch.js';

interface DiffViewProps {
  patch?: ParsedPatch;
}

const DiffView: React.FC<DiffViewProps> = ({ patch }) => {
  if (!patch) {
    return (
        <Box>
            <Text>No patch to preview</Text>
        </Box>
    )
  }
  return (
    <Box flexDirection="column">
      <Text color="yellow">Patch Preview</Text>
      {patch.files.map((file, i) => (
        <Box key={i} flexDirection="column">
          <Text bold>{file.path}</Text>
          {file.hunks.map((hunk, j) => (
             <Box key={j} flexDirection="column">
                <Text color="cyan">@@ -{hunk.oldStart},{hunk.oldLines} +{hunk.newStart},{hunk.newLines} @@</Text>
                {hunk.lines.map((line, k) => (
                    <Text key={k} color={line.startsWith('+') ? 'green' : line.startsWith('-') ? 'red' : 'white'}>
                        {line}
                    </Text>
                ))}
             </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default DiffView;
