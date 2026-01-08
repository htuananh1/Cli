import React from 'react';
import { Box, Text } from 'ink';

interface CommandOutputProps {
    logs: string[];
}

const CommandOutput: React.FC<CommandOutputProps> = ({ logs }) => {
    return (
        <Box flexDirection="column" borderStyle="single" borderColor="gray" height={10}>
            <Text color="yellow" bold>Command Output</Text>
            {logs.slice(-8).map((log, i) => (
                <Text key={i}>{log}</Text>
            ))}
        </Box>
    );
};

export default CommandOutput;
