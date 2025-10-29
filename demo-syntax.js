#!/usr/bin/env node

/**
 * Demo script to showcase the new @ and / syntax
 */

const chalk = require('chalk');

console.log(chalk.cyan.bold('\n🎯 AI Gateway CLI - New Syntax Demo\n'));

console.log(chalk.yellow('New Command Syntax:\n'));

console.log(chalk.green.bold('📁 File Operations (@) - Use @ for all file operations:'));
console.log(chalk.gray('  @read <file> [start] [end]  - View file with syntax highlighting'));
console.log(chalk.gray('  @edit <file>                - Interactive file editor'));
console.log(chalk.gray('  @write <file> <content>     - Create or overwrite file'));
console.log(chalk.gray('  @append <file> <content>    - Append text to file'));
console.log(chalk.gray('  @delete <file>              - Delete file or directory'));
console.log(chalk.gray('  @ls [dir]                   - List directory contents'));
console.log(chalk.gray('  @cd [dir]                   - Change directory'));
console.log(chalk.gray('  @pwd                        - Show current directory'));
console.log(chalk.gray('  @find <pattern>             - Search for files'));
console.log(chalk.gray('  @shell <command>            - Run shell command'));
console.log(chalk.gray('  @interactive <command>      - Run interactive command'));
console.log(chalk.gray('  @help                       - Show file commands help'));

console.log(chalk.blue.bold('\n⚙️ System Settings (/) - Use / for system settings:'));
console.log(chalk.gray('  /clear                      - Clear conversation history'));
console.log(chalk.gray('  /stats                      - Show conversation statistics'));
console.log(chalk.gray('  /file <path> <message>      - Chat with file content'));
console.log(chalk.gray('  /history                    - Show command history'));
console.log(chalk.gray('  /model <model>              - Change model'));
console.log(chalk.gray('  /temp <temperature>         - Change temperature'));
console.log(chalk.gray('  /theme <theme>              - Change UI theme'));
console.log(chalk.gray('  /config                     - Show configuration'));
console.log(chalk.gray('  /exit                       - Exit'));
console.log(chalk.gray('  /help                       - Show this help'));

console.log(chalk.magenta.bold('\n💬 Regular Chat - Just type your message:'));
console.log(chalk.gray('  Hello, how are you?'));
console.log(chalk.gray('  Write a Python function to sort a list'));
console.log(chalk.gray('  Explain quantum computing'));

console.log(chalk.yellow.bold('\n🚀 Usage Examples:\n'));

console.log(chalk.cyan('File Operations:'));
console.log(chalk.gray('  @ls                          # List current directory'));
console.log(chalk.gray('  @cd src                      # Change to src directory'));
console.log(chalk.gray('  @read cli.ts 1 20            # Read lines 1-20 of cli.ts'));
console.log(chalk.gray('  @edit config.json            # Edit config.json'));
console.log(chalk.gray('  @write test.js "console.log(\'hello\')"  # Create test.js'));
console.log(chalk.gray('  @find "*.ts"                 # Find all TypeScript files'));
console.log(chalk.gray('  @shell npm install           # Run npm install'));

console.log(chalk.cyan('\nSystem Settings:'));
console.log(chalk.gray('  /theme rainbow               # Change to rainbow theme'));
console.log(chalk.gray('  /model openai/gpt-4          # Change to GPT-4'));
console.log(chalk.gray('  /temp 0.9                    # Set temperature to 0.9'));
console.log(chalk.gray('  /config                      # Show current config'));
console.log(chalk.gray('  /stats                       # Show conversation stats'));

console.log(chalk.cyan('\nRegular Chat:'));
console.log(chalk.gray('  How do I create a React component?'));
console.log(chalk.gray('  Explain the difference between let and const'));
console.log(chalk.gray('  Write a function to reverse a string'));

console.log(chalk.green.bold('\n✨ Benefits of New Syntax:'));
console.log(chalk.gray('  • Clear separation: @ for files, / for settings'));
console.log(chalk.gray('  • Intuitive: @ looks like file attachment'));
console.log(chalk.gray('  • Organized: Commands are logically grouped'));
console.log(chalk.gray('  • Easy to remember: @ = files, / = system'));

console.log(chalk.magenta.bold('\n🎉 Try it now!'));
console.log(chalk.gray('  npx ai-gateway --theme rainbow'));
console.log(chalk.gray('  Then try: @ls, /theme, @help, /help\n'));