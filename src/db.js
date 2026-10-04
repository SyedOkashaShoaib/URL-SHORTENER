import "dotenv/config";
import pg from "pg";


export function createDbPool() {
    return new pg.Pool({
        max: 10,
        idleTimeoutMillis: 10000, //close idle connections after 10s
        connectionTimeoutMillis: 5000
    });
}

export async function insertQuery(short_code, original_url, pool ) {
    await pool.query(
        'INSERT INTO url_information (short_code, original_url) VALUES ($1, $2)',
        [short_code, original_url]
    );
}