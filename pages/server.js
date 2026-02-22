#!/usr/bin/env node

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    const fullPath = path.join(__dirname, filePath);

    fs.readFile(fullPath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log('========================================');
    console.log('🚀 ChainForgeLedger Visualization Server');
    console.log('========================================');
    console.log(`\n✅ Server running at: http://localhost:${PORT}`);
    console.log('\n📊 Dashboard Pages:');
    console.log('   - http://localhost:3000/ - Main Dashboard');
    console.log('   - http://localhost:3000/#blockchain - Blockchain Explorer');
    console.log('   - http://localhost:3000/#transactions - Transaction Explorer');
    console.log('   - http://localhost:3000/#smart-contracts - Smart Contracts');
    console.log('   - http://localhost:3000/#tokenomics - Tokenomics');
    console.log('   - http://localhost:3000/#governance - Governance (DAO)');
    console.log('   - http://localhost:3000/#network - Network Status');
    console.log('   - http://localhost:3000/#api - API Documentation');
    console.log('\n🎯 Features Demonstrated:');
    console.log('   - Real-time blockchain visualization');
    console.log('   - Transaction tracking and verification');
    console.log('   - Smart contract deployment simulation');
    console.log('   - Tokenomics and supply management');
    console.log('   - DAO governance and voting');
    console.log('   - Network monitoring and topology');
    console.log('\nPress Ctrl+C to stop the server');
    console.log('========================================');
});