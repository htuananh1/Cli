import * as fs from 'fs-extra';
import * as path from 'path';
import chalk from 'chalk';
import * as Diff from 'diff';

export interface PendingEdit {
  filePath: string;
  originalContent: string;
  newContent: string;
  timestamp: number;
}

export class EditManager {
  private editsPath: string;
  private pendingEdit: PendingEdit | null = null;

  constructor() {
    this.editsPath = path.join(process.cwd(), '.ai-code-edit.json');
  }

  async preview(filePath: string, newContent: string): Promise<void> {
    const absolutePath = path.resolve(filePath);
    
    let originalContent = '';
    if (await fs.pathExists(absolutePath)) {
      originalContent = await fs.readFile(absolutePath, 'utf-8');
    }

    const diff = Diff.diffLines(originalContent, newContent);
    
    console.log(chalk.cyan(`\nPreview changes for: ${filePath}`));
    console.log(chalk.gray('─'.repeat(70)));
    
    let hasChanges = false;
    diff.forEach((part) => {
      if (part.added) {
        hasChanges = true;
        console.log(chalk.green(`+ ${part.value.replace(/\n/g, '\n+ ')}`));
      } else if (part.removed) {
        hasChanges = true;
        console.log(chalk.red(`- ${part.value.replace(/\n/g, '\n- ')}`));
      } else {
        // Show context lines
        const lines = part.value.split('\n').slice(0, 3);
        if (lines.length > 0) {
          lines.forEach(line => {
            if (line.trim()) console.log(chalk.gray(`  ${line}`));
          });
        }
      }
    });

    console.log(chalk.gray('─'.repeat(70)));
    
    if (!hasChanges) {
      console.log(chalk.yellow('No changes detected'));
    } else {
      this.pendingEdit = {
        filePath: absolutePath,
        originalContent,
        newContent,
        timestamp: Date.now()
      };
      await this.savePending();
      console.log(chalk.green('\n✓ Changes previewed. Run `ai-code apply` to apply or `ai-code reject` to cancel.'));
    }
  }

  async apply(): Promise<void> {
    if (!this.pendingEdit) {
      console.log(chalk.yellow('No pending changes to apply'));
      return;
    }

    await fs.ensureDir(path.dirname(this.pendingEdit.filePath));
    await fs.writeFile(this.pendingEdit.filePath, this.pendingEdit.newContent, 'utf-8');
    console.log(chalk.green(`✓ Changes applied to ${this.pendingEdit.filePath}`));
    
    // Backup original
    const backupPath = `${this.pendingEdit.filePath}.ai-code-backup-${Date.now()}`;
    await fs.writeFile(backupPath, this.pendingEdit.originalContent, 'utf-8');
    console.log(chalk.gray(`  Backup saved to ${backupPath}`));

    this.pendingEdit = null;
    await this.savePending();
  }

  async reject(): Promise<void> {
    if (!this.pendingEdit) {
      console.log(chalk.yellow('No pending changes to reject'));
      return;
    }

    console.log(chalk.yellow(`✓ Changes rejected for ${this.pendingEdit.filePath}`));
    this.pendingEdit = null;
    await this.savePending();
  }

  private async savePending(): Promise<void> {
    if (this.pendingEdit) {
      await fs.writeJson(this.editsPath, this.pendingEdit, { spaces: 2 });
    } else {
      if (await fs.pathExists(this.editsPath)) {
        await fs.remove(this.editsPath);
      }
    }
  }

  async loadPending(): Promise<PendingEdit | null> {
    try {
      if (await fs.pathExists(this.editsPath)) {
        this.pendingEdit = await fs.readJson(this.editsPath);
        return this.pendingEdit;
      }
    } catch {
      // Ignore errors
    }
    return null;
  }

  hasPending(): boolean {
    return this.pendingEdit !== null;
  }
}
