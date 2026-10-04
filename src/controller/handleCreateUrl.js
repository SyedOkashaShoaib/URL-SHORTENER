import { validateUrl } from "../validateurl.js";
import { createUrl } from "../createUrl.js";
import { readReqData } from "../body.js";

export async function handleCreateUrl(req, res, pool, protocolSet) {

    if (req.headers['content-type'] !== 'application/json') {
        res.statusCode = 415;
        res.setHeader('Content-type', 'text/plain');
        res.end('Incorrect content type.');
        return;
    }

    try {
        const body = await readReqData(req); //returns  request body.
        const jsonBody = JSON.parse(body); //parse the request body.
        let { isValid, errorMessage } = validateUrl(jsonBody['url'], protocolSet);
        if (isValid) {
            const short_code = await createUrl(pool, jsonBody['url']); //rename short_code to shortUrl
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ short_url: short_code }));
            //we have not yet created the shortened url. im just returning the short code temporarily to understand the flow of the program.
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