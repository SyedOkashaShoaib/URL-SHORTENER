import process from "node:process";
let isShuttingDown = false;

async function shutdownServer(server) {
    return new Promise((resolve, reject) => {
        server.close((error) => {
            if (error) {
                reject(new Error("Server failed to close gracefully:", error.message));
                return;
            }
            else {
                resolve();
            }
        });
    });

}

export async function handleGracefulShutdown(signal, pool, server) {
    if (!isShuttingDown) {
        isShuttingDown = true;
        try {
            console.log(`Recieved signal: ${signal}. Intiating shutdown.`);
            await shutdownServer(server);
            console.log("HTTP server closed.");
            await pool.end();
            console.log("Database pool closed");
            process.exitCode = 0;

        }
        catch (error) {
            console.error("Graceful shutdown failed:",error.message);
            process.exitCode = 1;
        }

    }
}