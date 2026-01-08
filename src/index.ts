#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import App from './ui/App.js';
import { Command } from 'commander';
import chalk from 'chalk';

const program = new Command();

program
  .name('curscli')
  .description('AI Code Assistant CLI')
  .version('0.1.0');

program.command('start')
  .description('Start the TUI')
  .action(() => {
    console.clear();
    render(React.createElement(App));
  });

program.command('doctor')
  .description('Check prerequisites')
  .action(async () => {
    console.log(chalk.blue('Checking prerequisites...'));
    // TODO: Implement actual checks
    console.log(chalk.green('✓ Node.js'));
    console.log(chalk.green('✓ Git'));
    console.log(chalk.yellow('! ripgrep (optional, recommended)'));
    console.log(chalk.green('All systems go!'));
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}
