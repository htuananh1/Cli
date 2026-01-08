import { readFile, writeFile, createBackup, listFiles } from '../src/core/filesystem.js';
import { GitManager } from '../src/core/git.js';
import fs from 'fs-extra';
import path from 'path';

describe('Filesystem', () => {
  const testDir = 'test-fs';
  const testFile = path.join(testDir, 'hello.txt');

  beforeAll(async () => {
    await fs.ensureDir(testDir);
  });

  afterAll(async () => {
    await fs.remove(testDir);
    await fs.remove('.curscli');
  });

  test('writeFile and readFile', async () => {
    await writeFile(testFile, 'Hello World');
    const content = await readFile(testFile);
    expect(content).toBe('Hello World');
  });

  test('createBackup', async () => {
    const backupPath = await createBackup(testFile);
    expect(await fs.pathExists(backupPath)).toBe(true);
    const content = await readFile(backupPath);
    expect(content).toBe('Hello World');
  });
});

describe('GitManager', () => {
    test('instantiates', () => {
        const git = new GitManager('.');
        expect(git).toBeDefined();
    });
});
