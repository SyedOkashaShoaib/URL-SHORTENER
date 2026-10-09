import { validateUrl } from "../validateurl.js";
import { createUrl } from "../createUrl.js";
import { readReqData } from "../body.js";
import "dotenv/config";

export async function handleCreateUrl(req, res, pool, protocolSet) {

    const contentType = req.headers['content-type'] ?? ''; // ?? is a logical operator that returns the value on left if it is not null, or undefined, otherwisee it retursn the value on the right.
    const mediaType = contentType.split(';')[0].toLowerCase();
    if (mediaType !== 'application/json') {
        res.statusCode = 415;
        res.end('Incorrect Content Type. Ensure the content type is application/json');
        return;
    }

    try {
        const body = await readReqData(req); //returns  request body.
        const jsonBody = JSON.parse(body); //parse the request body.
        let { isValid, errorMessage } = validateUrl(jsonBody['url'], protocolSet);
        if (isValid) {
            const shortCode = await createUrl(pool, jsonBody['url']);
            const shortUrl = new URL(shortCode, process.env.BASE);
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ short_url: shortUrl.href })); //href sends a string. if we wrote shortUrl only, even then a string would have been sent, however this makes the intention more evident.
            return;
        }

        res.statusCode = 400;
        res.end(errorMessage);
        return;
    }

    catch (error) {
        if (error.code === 'SIZE_ERROR') {
            res.statusCode = 413;
            res.end('Request body size exceeds allowed threshold');
            return;
        }
        else if (error instanceof SyntaxError) { //handles json.parse errors..
            res.statusCode = 400;
            res.end('The request data is not valid JSON');
            return;
        }
        else {
            res.statusCode = 500;
            res.end("An internal server error occured");
            return;
        }
    }
}