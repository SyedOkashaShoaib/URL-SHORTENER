import { returnOriginalUrl } from "../db.js"



export async function handleRedirectUrl(shortCode, res, pool) {
    try {
        const original_url = await returnOriginalUrl(shortCode, pool);
        console.log(shortCode);
        if (original_url === false) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('Any corresponding URL to the provided URL could not be found.');
            return;
        }
        else {
            //**
            //How a redirect works

            //The server doesn't forward anything. It replies with a 3xx status and a 
            // Location header, and the client then sends a second request to that URL: 

            // GET /aB3x9Q HTTP/1.1          →   HTTP/1.1 302 Found
            // Host: localhost:3000               Location: https://example.com/long/page

            // GET /long/page HTTP/1.1       ← the client's second request, to the new URL
            // Host: example.com
            console.log("Redirecting..");
            res.statusCode = 307;
            res.setHeader('Location', original_url);
            res.end();

        }



    }
    catch (error) {
        res.statusCode = 500;
        res.setHeader('Content-Type','text/plain');
        res.end('An internal server error has occured');
    }


}
