import { exec } from 'child_process';

export function runCommand(command: string, onData: (data: string) => void, onExit: (code: number) => void) {
    const process = exec(command);

    process.stdout?.on('data', (data) => {
        onData(data.toString());
    });

    process.stderr?.on('data', (data) => {
        onData(data.toString());
    });

    process.on('exit', (code) => {
        onExit(code || 0);
    });

    return process;
}
