import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import qrcode from 'qrcode-terminal';
import os from 'os';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

export const startMobilePasteServer = (port: number = 3000) => {
    const app = express();
    app.use(cors());
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));

    // Serve a simple HTML page
    app.get('/', (req, res) => {
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>CursCLI Mobile Paste</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
                    textarea { width: 100%; height: 300px; padding: 10px; margin-bottom: 10px; border-radius: 5px; border: 1px solid #ccc; font-family: monospace; }
                    button { padding: 10px 20px; font-size: 16px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer; }
                    button:hover { background-color: #0056b3; }
                    .status { margin-top: 10px; padding: 10px; border-radius: 5px; display: none; }
                    .success { background-color: #d4edda; color: #155724; display: block; }
                    .error { background-color: #f8d7da; color: #721c24; display: block; }
                </style>
            </head>
            <body>
                <h1>Paste to CursCLI</h1>
                <p>Paste your code or text below and click submit to send it to the CLI.</p>
                <textarea id="content" placeholder="Paste here..."></textarea>
                <button onclick="submitContent()">Send to CLI</button>
                <div id="status" class="status"></div>

                <script>
                    async function submitContent() {
                        const content = document.getElementById('content').value;
                        const statusDiv = document.getElementById('status');

                        try {
                            const response = await fetch('/submit', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ content })
                            });

                            if (response.ok) {
                                statusDiv.textContent = 'Successfully sent to CLI!';
                                statusDiv.className = 'status success';
                                document.getElementById('content').value = '';
                            } else {
                                statusDiv.textContent = 'Error sending data.';
                                statusDiv.className = 'status error';
                            }
                        } catch (e) {
                            statusDiv.textContent = 'Connection error: ' + e.message;
                            statusDiv.className = 'status error';
                        }
                    }
                </script>
            </body>
            </html>
        `);
    });

    app.post('/submit', (req, res) => {
        const content = req.body.content;
        if (!content) {
            return res.status(400).send({ error: 'No content provided' });
        }

        const fileName = 'mobile_paste_data.txt';
        const filePath = path.join(process.cwd(), fileName);

        // Append to file (or overwrite? "save data" usually implies keeping it. Let's append with timestamp)
        const entry = `\n--- Paste at ${new Date().toISOString()} ---\n${content}\n----------------------------------\n`;

        fs.appendFile(filePath, entry, (err) => {
            if (err) {
                console.error('Error saving file:', err);
                return res.status(500).send({ error: 'Failed to save' });
            }
            console.log(chalk.green(`\n\nReceived content from mobile (${content.length} chars). Saved to ${fileName}`));
            console.log(chalk.gray('Preview: ' + content.substring(0, 50) + (content.length > 50 ? '...' : '')));
            res.send({ success: true });
        });
    });

    const getLocalIp = () => {
        const nets = os.networkInterfaces();
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]!) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                if (net.family === 'IPv4' && !net.internal) {
                    return net.address;
                }
            }
        }
        return 'localhost';
    };

    const server = app.listen(port, () => {
        const ip = getLocalIp();
        const url = `http://${ip}:${port}`;
        console.clear();
        console.log(chalk.blue('Mobile Paste Server Running!'));
        console.log(`Scan the QR code below or visit: ${chalk.underline(url)}`);
        console.log('Press Ctrl+C to stop.');
        console.log('');

        qrcode.generate(url, { small: true });
    });
};
