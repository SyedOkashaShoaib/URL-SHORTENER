import "dotenv/config";
import pg from "pg";


export async function createDbPool() {
    const pool = new pg.Pool({
        max: 10,
        idleTimeoutMillis: 10000, //close idle connections after 10s
        connectionTimeoutMillis: 5000
    }); 
    //Database connection is lazy -> Deferred until actually needed. new pool simply returns an
    //object holding your database configurations. 
    try {
        await pool.query('SELECT 1'); // connection actually made here. Thats why this is used for health check up. 
    }
    catch (error) {
        throw new Error(error.message);
    }
    return pool;
}

export async function insertQuery(short_code, original_url, pool) {
    await pool.query(
        'INSERT INTO url_information (short_code, original_url) VALUES ($1, $2)',
        [short_code, original_url]
    );
}

export async function returnOriginalUrl(shortCode, pool) {
    const result = await pool.query(
        'SELECT original_url from url_information WHERE short_code = $1',
        [shortCode]
    );
    return (result.rows[0]) ? result.rows[0].original_url : false;
}
