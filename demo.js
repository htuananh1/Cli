#!/usr/bin/env node

/**
 * Demo script to showcase AI Gateway CLI enhanced features
 */

const { exec } = require('child_process');
const chalk = require('chalk');

console.log(chalk.cyan.bold('\n🚀 AI Gateway CLI - Enhanced Features Demo\n'));

console.log(chalk.yellow('This demo will showcase the new features:\n'));

const features = [
  '✨ Beautiful terminal UI with themes and animations',
  '🔧 Enhanced shell execution with interactive commands',
  '📁 Comprehensive file operations (read, write, edit, delete)',
  '🗂️ Directory navigation and file system browsing',
  '📝 Interactive file editor with syntax highlighting',
  '🔍 File search with glob patterns',
  '📊 Command history and configuration management',
  '🎨 Multiple themes (default, dark, light, rainbow)',
  '⚡ Progress bars and visual feedback'
];

features.forEach((feature, index) => {
  console.log(chalk.green(`  ${index + 1}. ${feature}`));
});

console.log(chalk.cyan('\n🎯 Available Commands:\n'));

const commands = [
  { cmd: '/ls', desc: 'List directory contents with icons and metadata' },
  { cmd: '/cd <dir>', desc: 'Change directory' },
  { cmd: '/read <file>', desc: 'View file with syntax highlighting' },
  { cmd: '/edit <file>', desc: 'Interactive file editor' },
  { cmd: '/write <file> <content>', desc: 'Create or overwrite file' },
  { cmd: '/delete <file>', desc: 'Delete file or directory' },
  { cmd: '/find <pattern>', desc: 'Search for files' },
  { cmd: '/shell <command>', desc: 'Run shell command' },
  { cmd: '/interactive <command>', desc: 'Run interactive shell command' },
  { cmd: '/theme <theme>', desc: 'Change UI theme' },
  { cmd: '/config', desc: 'Show configuration' },
  { cmd: '/history', desc: 'Show command history' }
];

commands.forEach(cmd => {
  console.log(chalk.blue(`  ${cmd.cmd.padEnd(20)} - ${cmd.desc}`));
});

console.log(chalk.yellow('\n🎨 Available Themes:\n'));
console.log(chalk.gray('  • default - Clean, professional appearance'));
console.log(chalk.gray('  • dark    - Dark background with light text'));
console.log(chalk.gray('  • light   - Light background with dark text'));
console.log(chalk.gray('  • rainbow - Gradient color effects'));

console.log(chalk.cyan('\n🚀 Quick Start:\n'));
console.log(chalk.green('  1. Set your API key:'));
console.log(chalk.gray('     export AI_GATEWAY_API_KEY="your-key-here"'));
console.log(chalk.green('  2. Start the CLI:'));
console.log(chalk.gray('     npx ai-gateway'));
console.log(chalk.green('  3. Try a theme:'));
console.log(chalk.gray('     npx ai-gateway --theme rainbow'));
console.log(chalk.green('  4. Explore the file system:'));
console.log(chalk.gray('     /ls'));
console.log(chalk.gray('     /cd src'));
console.log(chalk.gray('     /read cli.ts'));

console.log(chalk.magenta('\n🎉 Enjoy your enhanced AI Gateway CLI experience!\n'));

// Show current directory structure
console.log(chalk.cyan('📁 Current Directory Structure:\n'));
exec('ls -la', (error, stdout, stderr) => {
  if (error) {
    console.log(chalk.red('Error listing directory:'), error.message);
    return;
  }
  
  const lines = stdout.split('\n').slice(1); // Skip total line
  lines.forEach(line => {
    if (line.trim()) {
      const parts = line.split(/\s+/);
      const permissions = parts[0];
      const size = parts[4];
      const name = parts.slice(8).join(' ');
      
      let icon = '📄';
      if (permissions.startsWith('d')) icon = '📁';
      else if (name.endsWith('.js')) icon = '📄';
      else if (name.endsWith('.ts')) icon = '📄';
      else if (name.endsWith('.json')) icon = '📄';
      else if (name.endsWith('.md')) icon = '📝';
      
      console.log(chalk.gray(`  ${icon} ${name.padEnd(30)} ${size.padStart(8)} bytes`));
    }
  });
  
  console.log(chalk.yellow('\n💡 Tip: Use /ls in the CLI for a more detailed view!\n'));
});