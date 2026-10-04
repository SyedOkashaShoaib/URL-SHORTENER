import { generateShortCode } from "./generateCode.js";
import { insertQuery } from "./db.js";

export async function createUrl(pool, original_url) {
    for (let i = 0; i < 5; i++) {
        let short_code = generateShortCode();
        try {
            await insertQuery(short_code, original_url, pool);
            return short_code;
        }
        catch (error) {
            if (error.code === '23505') {
                console.error("Error: the function responsible for generating random code generated a duplicate. Retrying. Attempt number :", i+1);
                //We dont need to throw this error, just logging it (later in a log file perhaps? ) for traceability.
            }
            else {
                throw new Error('An error occured while inserting the generated code in the database');
                //how does the server handle these types of errors? 
            }
        }
    }
    //we have tried to generate a unique code 5 times and failed! How unlikely that would be. Now we throw an error.
    const generationFailedError = new Error("Code generation failed");
    generationFailedError.code = 'CODE_GENERATION_FAILED';
    throw generationFailedError;
}