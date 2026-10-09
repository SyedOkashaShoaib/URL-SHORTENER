import { createDbPool } from "./db.js";
import { createServer } from "./server.js";
import { validateConfig } from "./validateConfig.js";
import { handleGracefulShutdown } from "./handleShutdown.js"
import process from "node:process";

let pool;
let server;
try {
    validateConfig();
    const protocolSet = new Set(
        ["http:",
            "https:"]
    );
    pool = await createDbPool();
    server = createServer(pool, protocolSet);
    server.listen(3000, () => {
        console.log("Server is listening for incoming requets...");
    });
}
catch (error) {
    console.error("Server startup failed: ", error.message);
    process.exit(1);
}

process.on("SIGINT", () => handleGracefulShutdown("SIGINT", pool, server));
process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM", pool, server));