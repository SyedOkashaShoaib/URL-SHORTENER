import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import { exit } from "node:process";
import { validateUrl } from "./validateurl.js";

const MAX_BODY_SIZE = 1e3;
let protocolSet = null;


function populateProtocolSet() {
    const filePath = path.resolve('src', 'settings.json');
    let protocols = '';
    try {
        protocols = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        // console.log(protocols);
    }
    catch (error) {
        console.error(error.message);
        exit(1);
    }
    protocolSet = new Set(protocols);
    console.log(protocolSet);
}

const server = http.createServer((req, res) => {
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    let size = 0;
    let body = '';
    let rejected = false;

    switch (req.method) {
        case 'POST':
            if (parsedUrl.pathname === '/urls' && Object.keys(Object.fromEntries(parsedUrl.searchParams)).length === 0) {
                if (req.headers['content-type'] !== 'application/json') {
                    res.statusCode = 415;
                    res.setHeader('Content-type', 'text/plain');
                    res.end('Incorrect content type.');
                    return;
                }
                req.on('data', (chunk) => {
                    if (rejected === true) {
                        return;
                    }
                    size += chunk.length;
                    if (size > MAX_BODY_SIZE) {
                        res.statusCode = 413;
                        res.setHeader('Content-Type', 'text/plain');
                        res.end('Request body size exceeds allowed threshold');
                        rejected = true;
                        return;
                    }
                    body += chunk;
                });
                req.on('end', () => {
                    if (rejected === true) {
                        return;
                    }
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'text/plain');
                    let parsedReqData = '';
                    try {
                        parsedReqData = JSON.parse(body);
                    }
                    catch (error) {
                        console.log(error.message);
                        res.end('The request data is not valid JSON');
                        return;
                    }
                    let {isValid, errorMessage }= validateUrl(parsedReqData['url'], protocolSet);
                    console.log(isValid);
                    if (isValid === true) {
                        res.statusCode = 201;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify("later on, this will contain the shortened url"));
                        return;
                    }
                    res.end(errorMessage);
                    return;
                })
            }
            else {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain');
                res.end("404 not found");
            }
            break;
        default:
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('The server can not process this request.');
    }
});


populateProtocolSet();
server.listen(3000);

//the codebase needs to be refactored badly


// Every request path through your handler must eventually produce a response.



/**
 * What is an IncomingMessage? 
 * -> IncomingMessage is the object which is passed as  the first argument to the callback registered with
 * the request event on the server side, and to the response event on the client side. 
 * it extends stream.Readable. 
 * in the case of the request object, it is used to read the contents of requests, and use methods 
 * attached to it. 
 * 
 * 
 * Events to know about: 
 * data => Fires when there is a chunk of data to be read. 
 * end => fires when all the data has been consumed. Fires at the reader's end.
 */
/**
 * Stuff I need to do : 
 * 1. read the entire request body. 
 * what do i need to verify? 
 * method -> POST
 *  POST /url
 */