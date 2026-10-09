const MAX_BODY_SIZE = 1e3;


export async function readReqData(req) {
    let rejected = false;
    let size = 0;
    let body = '';
    return new Promise((resolve, reject) => {
        req.on('data', (chunk) => {
            if (rejected === true) {
                return;
            }
            size += chunk.length;
            if (size > MAX_BODY_SIZE) {

                rejected = true;
                const sizeError = new Error('Request body size exceeds allowed threshold');
                sizeError.code = 'SIZE_ERROR';
                reject(sizeError);
                return; //reject does not implicitly return. 
            }
            body += chunk;
        });
        req.on('end', () => {
            if (!rejected) {
                resolve(body);
                return;
            }
        })
         req.on('error',reject );
    });
       

}

