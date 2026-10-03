import http from "node:http";
import path from "node:path";
import fs from "node:fs";
import { exit } from "node:process";
import { validateUrl } from "./validateurl.js";
import { validateCode } from "./validateCode.js";
import "dotenv/config";
import pg from "pg";

const MAX_BODY_SIZE = 1e3;
let protocolSet = null;


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
                req.on('end', async () => {
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
                        console.error(error.message);
                        res.end('The request data is not valid JSON');
                        return;
                    }
                    let { isValid, errorMessage } = validateUrl(parsedReqData['url'], protocolSet);
                    // console.log(isValid);
                    if (isValid === true) {
                        try {
                            const short_code = await validateCode(pool, parsedReqData['url']);
                            res.statusCode = 201;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({short_url : short_code}));
                            //we have not yet created the shortened url. im just returning the short code temporarily to understand the flow of the program.
                            return;
                        }
                        catch (error) {
                            if (error.code === 'UNKNOWN_DATABASE_ERROR') {
                                res.statusCode = 500;
                                res.setHeader('Content-Type', 'text/plain');
                                res.end("An internal server error occured");
                                return;
                            }
                            else if (error.code === 'CODE_GENERATION_FAILED') {
                                res.statusCode = 500;
                                res.setHeader('Content-Type', 'text/plain');
                                res.end("An internal server error occured");
                                return;
                                //*If i am handling both errors the same way, then why two different conditional blocks? 
                                // Perhaps i can handle code generation failed error in another way. But this error is very
                                // unlikely to occur. */
                            }
                        }

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
const pool = new pg.Pool({
    max: 10,
    idleTimeoutMillis: 10000, //close idle connections after 10s
    connectionTimeoutMillis: 5000
});
server.listen(3000);

//the codebase needs to be refactored badly. Everything is starting to look apocalyptic.


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