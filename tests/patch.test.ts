import { parsePatch, applyPatch } from '../src/core/patch.js';
import { writeFile, readFile } from '../src/core/filesystem.js';
import fs from 'fs-extra';
import path from 'path';

describe('Patch System', () => {
  const testDir = 'test-patch';
  const testFile = path.join(testDir, 'test.js');

  beforeAll(async () => {
    await fs.ensureDir(testDir);
  });

  afterAll(async () => {
    await fs.remove(testDir);
    await fs.remove('.curscli');
  });

  test('parsePatch parses unified diff', () => {
    const diff = `Index: test.js
===================================================================
--- test.js
+++ test.js
@@ -1,3 +1,3 @@
-console.log('hello');
+console.log('world');
`;
    const parsed = parsePatch(diff);
    expect(parsed.files.length).toBe(1);
    expect(parsed.files[0].path).toBe('test.js');
  });

  test('applyPatch applies changes', async () => {
    await writeFile(testFile, "console.log('hello');\n");

    const diff = `--- test.js
+++ test.js
@@ -1 +1 @@
-console.log('hello');
+console.log('world');
`;
    const parsed = parsePatch(diff);
    parsed.files[0].path = testFile;

    const result = await applyPatch(parsed);
    expect(result.success).toBe(true);

    const content = await readFile(testFile);
    expect(content.trim()).toBe("console.log('world');");
  });
});
