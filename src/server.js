import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import { exit } from "node:process";
import { handleCreateUrl } from "./controller/handleCreateUrl.js";
import { createDbPool } from "./db.js";


let protocolSet = null;
const SHORT_URL_PATHNAME_PATTERN = /^[A-Za-z0-9]{6}$/;

function populateProtocolSet() {
    const filePath = path.resolve('src', 'settings.json');
    let protocols = '';
    try {
        protocols = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    }
    catch (error) {
        console.error(error.message);
        exit(1);
    }
    protocolSet = new Set(protocols);
}

const server = http.createServer(async (req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    res.setHeader('Content-Type', 'text/plain');
    switch (req.method) {
        case 'POST':
            if (parsedUrl.pathname === '/urls' && Object.keys(Object.fromEntries(parsedUrl.searchParams)).length === 0) {
                await handleCreateUrl(req, res, pool, protocolSet);
                return;
            }
            else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain');
                res.end("The requested web page or resource could not be found");
            }
            break;
        case 'GET':
            if (SHORT_URL_PATHNAME_PATTERN.test(parsedUrl.pathname)) {
                
            }
            break;
        default:
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('The server can not process this request.');
    }
});


populateProtocolSet();
const pool = createDbPool();
server.listen(3000);
