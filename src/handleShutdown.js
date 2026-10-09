import { exitCode } from "node:process";
export async function shutdown(pool, server) {
    await server.close(); //stop accepting new reqs. Wjat happens to requests that are ongoign though?
    await pool.close(); //close db connection. What happens if a query is being processed at the same time this is called? 
    exitCode = 0;

}