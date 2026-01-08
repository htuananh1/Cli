import fs from 'fs-extra';
import path from 'path';

export const BACKUP_DIR = '.curscli/backups';

export async function readFile(filepath: string): Promise<string> {
  return fs.readFile(filepath, 'utf-8');
}

export async function writeFile(filepath: string, content: string): Promise<void> {
  await fs.ensureDir(path.dirname(filepath));
  await fs.writeFile(filepath, content, 'utf-8');
}

export async function createBackup(filepath: string): Promise<string> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = path.basename(filepath);
  const backupPath = path.join(BACKUP_DIR, `${filename}.${timestamp}`);

  await fs.ensureDir(BACKUP_DIR);
  await fs.copy(filepath, backupPath);

  return backupPath;
}

export async function listFiles(dir: string, ignorePatterns: string[] = []): Promise<string[]> {
    // Basic recursive file lister - to be enhanced later or replaced by glob
    // For MVP we can use glob or simple recursion
    // Using glob for simplicity as it supports ignore patterns
    const { glob } = await import('glob');
    const files = await glob('**/*', {
        cwd: dir,
        ignore: ignorePatterns,
        nodir: true,
        dot: true
    });
    return files;
}
