import { simpleGit, SimpleGit, StatusResult } from 'simple-git';

export class GitManager {
  private git: SimpleGit;

  constructor(baseDir: string) {
    this.git = simpleGit(baseDir);
  }

  async isGitRepository(): Promise<boolean> {
    try {
      return await this.git.checkIsRepo();
    } catch {
      return false;
    }
  }

  async getStatus(): Promise<StatusResult> {
    return this.git.status();
  }

  async stageFile(filepath: string): Promise<void> {
    await this.git.add(filepath);
  }

  async commit(message: string): Promise<void> {
    await this.git.commit(message);
  }

  async getRecentCommits(limit: number = 5) {
    return this.git.log({ maxCount: limit });
  }
}
