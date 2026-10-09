import http from "node:http";
import { handleCreateUrl } from "./controllers/handleCreateUrl.js";
import { handleRedirectUrl } from "./controllers/handleRedirectUrl.js";

const SHORT_URL_PATHNAME_PATTERN = /^\/([A-Za-z0-9]{6})$/;

export function createServer(pool, protocolSet) {

    const server = http.createServer(async (req, res) => {
        const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
        res.setHeader('Content-Type', 'text/plain');
        const match = parsedUrl.pathname.match(SHORT_URL_PATHNAME_PATTERN);
        if (parsedUrl.pathname === '/urls') {
            if (req.method === 'POST') {
                await handleCreateUrl(req, res, pool, protocolSet);
                return;
            }
            else {
                res.statusCode = 405;
                res.setHeader('Allow', 'POST');
                res.end("Method not allowed");
                return;
            }
        }
        else if (match) {
            if (req.method === 'GET') {
                const shortCode = match[1];
                await handleRedirectUrl(shortCode, res, pool);
                return;
            }
            else {
                res.statusCode = 405;
                res.setHeader('Allow', 'GET');
                res.end("Method not allowed");
                return;
            }
        }
        else {
            res.statusCode = 404;
            res.end('The server can not process this request.');
            return;
        }
    }
    );
    return server;
}

