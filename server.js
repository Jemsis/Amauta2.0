const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';
const PUBLIC_DIR = path.join(__dirname, 'frontend');

const mimeTypes = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function sendResponse(res, statusCode, data, contentType) {
  res.writeHead(statusCode, { 'Content-Type': contentType });
  res.end(data);
}

function send404(res) {
  sendResponse(res, 404, '404 Not Found', 'text/plain');
}

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      send404(res);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    sendResponse(res, 200, data, contentType);
  });
}

const server = http.createServer((req, res) => {
  const requestUrl = req.url.split('?')[0];
  let safePath = path.normalize(decodeURIComponent(requestUrl));

  if (safePath.includes('..')) {
    send404(res);
    return;
  }

  if (safePath === '/' || safePath === '') {
    safePath = '/index.html';
  }

  const filePath = path.join(PUBLIC_DIR, safePath);

  fs.stat(filePath, (err, stats) => {
    if (err) {
      send404(res);
      return;
    }

    if (stats.isDirectory()) {
      serveFile(path.join(filePath, 'index.html'), res);
      return;
    }

    serveFile(filePath, res);
  });
});

server.listen(PORT, HOST, () => {
  console.log(`Servidor iniciado en http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log('Carpeta frontend servida desde:', PUBLIC_DIR);
});
