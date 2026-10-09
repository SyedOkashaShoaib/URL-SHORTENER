import { createDbPool } from "./db.js";
import { createServer } from "./server.js";
import { validateConfig } from "./validateConfig.js";
import { shutdown } from "./handleShutdown.js";
import { process } from "node:process";

try {
    validateConfig();
    const protocolSet = new Set(
        ["http:",
         "https:"]
    );
    const pool = await createDbPool();
    const server = createServer(pool, protocolSet);
    server.listen(3000, () => {
        console.log("Server is listening for incoming requets...");
    });
}
catch (error) {
    console.error("Server startup failed: ", error.message);
    process.exit(1);
}

process.on("SIGINT", async () => {
    try {
        await shutdown(pool, server);
        process.exitCode = 0;
    }
    catch (error) {
        process.exitCode = 1;
    }
    console.log("Shutting down server..");
    process.exit();
});

process.on("SIGTERM", async () => {
    try {
        await shutdown(pool, server);
        process.exitCode = 0;
    }
    catch (error) {
        process.exitCode = 1;
    }
    console.log("Shutting down server..");
    process.exit();
});