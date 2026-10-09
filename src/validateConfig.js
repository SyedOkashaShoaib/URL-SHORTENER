export function validateConfig() {
    const requiredVars = [
        'BASE',
        'PGHOST',
        'PGPORT',
        'PGUSER',
        'PGPASSWORD',
        'PGDATABASE'
    ];

    for (const variable of requiredVars) {
        if (!process.env[variable]?.trim()) {
            throw new Error(
                `Missing required environment variable: ${variable}`
            );
        }
    }

    let baseUrl;

    try {
        baseUrl = new URL(process.env.BASE);
    }
    catch {
        throw new Error('BASE_URL must be a valid URL');
    }

    if (
        baseUrl.protocol !== 'http:' &&
        baseUrl.protocol !== 'https:'
    ) {
        throw new Error('BASE_URL must use HTTP or HTTPS');
    }

    const pgPort = Number(process.env.PGPORT);

    if (
        !Number.isInteger(pgPort) ||
        pgPort < 1 ||
        pgPort > 65535
    ) {
        throw new Error('PGPORT must be a valid port number');
    }
}