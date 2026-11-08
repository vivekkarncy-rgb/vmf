const http = require('http');
const fs = require('fs');
const path = require('path');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.avif': 'image/avif',
  '.xml': 'application/xml',
  '.txt': 'text/plain'
};

const server = http.createServer((req, res) => {
  // 1. API: Save Image
  if (req.method === 'POST' && req.url === '/api/save-image') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const { filename, base64 } = JSON.parse(body);
        const data = base64.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(data, 'base64');
        const targetPath = path.join(__dirname, 'assets', filename);
        fs.writeFileSync(targetPath, buffer);
        console.log('[API] Saved image to:', targetPath, buffer.length);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        console.error('[API ERROR] Error saving image:', e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 2. API: Chatbot Query to Admin
  if (req.method === 'POST' && (req.url === '/api/admin/query' || req.url === '/api/send-query')) {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const queryData = JSON.parse(body);
        const queriesPath = path.join(__dirname, 'admin-queries.json');
        let queries = [];
        if (fs.existsSync(queriesPath)) {
          try {
            queries = JSON.parse(fs.readFileSync(queriesPath, 'utf8'));
          } catch (err) {
            queries = [];
          }
        }
        queries.unshift(queryData);
        fs.writeFileSync(queriesPath, JSON.stringify(queries, null, 2), 'utf8');
        console.log(`[ADMIN DESK] Received new query [${queryData.ticketId || 'TICKET'}] from ${queryData.name} (${queryData.email}, ${queryData.phone})`);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, ticketId: queryData.ticketId }));
      } catch (e) {
        console.error('[API ERROR] Error receiving admin query:', e);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: e.message }));
      }
    });
    return;
  }

  // 3. Static files
  let reqPath = req.url.split('?')[0];
  if (reqPath === '/') reqPath = '/index.html';
  const filePath = path.join(__dirname, reqPath);

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not found');
  }
});

const PORT = 3333;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
