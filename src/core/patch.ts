import * as Diff from 'diff';
import { readFile, writeFile, createBackup } from './filesystem.js';
import path from 'path';

export interface ParsedPatch {
  files: {
    path: string;
    hunks: Diff.Hunk[];
    originalContent?: string;
    newContent?: string;
  }[];
}

export function parsePatch(diffContent: string): ParsedPatch {
  const parsed = Diff.parsePatch(diffContent);
  return {
    files: parsed.map(p => ({
      path: p.newFileName || p.oldFileName || 'unknown',
      hunks: p.hunks
    }))
  };
}

export async function applyPatch(patch: ParsedPatch, dryRun: boolean = false): Promise<{ success: boolean; error?: string }> {
  for (const file of patch.files) {
    let targetPath = file.path;
    if (targetPath.startsWith('a/') || targetPath.startsWith('b/')) {
        targetPath = targetPath.substring(2);
    }

    if (path.isAbsolute(targetPath) || targetPath.includes('..')) {
         return { success: false, error: `Invalid file path: ${targetPath}` };
    }

    try {
      let originalContent = '';
      try {
        originalContent = await readFile(targetPath);
      } catch (e) {
        if ((e as any).code !== 'ENOENT') throw e;
      }

      const patchedContent = Diff.applyPatch(originalContent, file);

      if (patchedContent === false) {
        return { success: false, error: `Failed to apply patch for ${targetPath}` };
      }

      if (!dryRun) {
        if (originalContent) {
           await createBackup(targetPath);
        }
        await writeFile(targetPath, patchedContent);
      }
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  }
  return { success: true };
}
