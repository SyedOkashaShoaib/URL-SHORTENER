import { createDbPool } from "./db.js";
import { createServer } from "./server.js";
import { validateConfig } from "./validateConfig.js";
import path from "node:path";
import fs from "node:fs";
import { exit } from "node:process";



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
    const protocolSet = new Set(protocols);
    return protocolSet;
}
try {
    validateConfig();
    const protocolSet = populateProtocolSet();
    const pool = await createDbPool();
    const server = createServer(pool, protocolSet);
    server.listen(3000, () => {
        console.log("Server is listening for incoming requets...");
    });
}
catch(error) {
    console.error("Server startup failed: ", error.message);
    exit(1);
}
