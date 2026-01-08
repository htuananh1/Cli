import { readFile, writeFile, createBackup, listFiles } from './filesystem.js';
import { GitManager } from './git.js';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

export interface SearchResult {
  file: string;
  line: number;
  content: string;
}

export async function searchProject(query: string, dir: string): Promise<SearchResult[]> {
  // Try ripgrep first
  try {
    const { stdout } = await execAsync(`rg -n "${query}" "${dir}"`);
    return parseRgOutput(stdout);
  } catch (e) {
    // ripgrep failed or not found, fallback to JS
    return fallbackSearch(query, dir);
  }
}

function parseRgOutput(output: string): SearchResult[] {
  const results: SearchResult[] = [];
  const lines = output.trim().split('\n');
  for (const line of lines) {
    // rg output: file:line:content
    const parts = line.split(':');
    if (parts.length >= 3) {
      results.push({
        file: parts[0],
        line: parseInt(parts[1], 10),
        content: parts.slice(2).join(':').trim()
      });
    }
  }
  return results;
}

async function fallbackSearch(query: string, dir: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];
  const files = await listFiles(dir, ['**/node_modules/**', '**/.git/**', '**/dist/**']);

  for (const file of files) {
    try {
      const content = await readFile(file);
      const lines = content.split('\n');
      lines.forEach((lineContent, index) => {
        if (lineContent.includes(query)) {
          results.push({
            file,
            line: index + 1,
            content: lineContent.trim()
          });
        }
      });
    } catch (e) {
      // Ignore read errors
    }
  }
  return results;
}
