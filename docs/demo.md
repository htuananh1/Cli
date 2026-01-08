# Demo Script

1. **Start the App**
   Run `npm start` to launch CursCli.

2. **Navigation**
   - Press `Ctrl+B` to toggle the file tree sidebar.
   - Press `Ctrl+P` to open the File Palette. Type "App" and press Enter to "open" `src/ui/App.tsx`.
   - The Editor pane will show the filename.

3. **Chat & Patching**
   - In the Chat pane (Right), type "Can you generate a patch?" and press Enter.
   - The Mock AI will respond with a sample patch.
   - The UI automatically switches to the "Diff View" (Center Pane) showing the colorful diff.
   - Press `Ctrl+Enter`.
   - The patch logic attempts to apply it. Since the file paths in the mock patch likely don't exist, it might fail or show an error in the Command Output pane.

4. **Command Runner**
   - Press `Ctrl+K` to open the Command Palette.
   - Select "Run Tests" (or type it).
   - The Command Output pane (Bottom) will appear and show the output of `npm test`.

5. **Exit**
   - Press `Ctrl+C` to exit the application.
