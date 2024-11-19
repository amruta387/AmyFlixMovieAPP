const http = require('http'); 
const fs = require('fs'); 
const url = require('url'); 

const port = 8080;

// Create the server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const timestamp = new Date().toISOString();
    const logMsg = `${timestamp} - ${req.url}\n`;

    // Log the request URL and timestamp to log.txt
    fs.appendFile('log.txt', logMsg, (err) => {
        if (err) {
            console.error('Error logging request:', err);
        }
    });

    if (parsedUrl.pathname.includes('documentation')) {
        fs.readFile('documentation.html', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading documentation.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    } else {
        fs.readFile('index.html', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('Error loading index.html');
            } else {
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            }
        });
    }
});

server.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});
