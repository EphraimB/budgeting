import pg, { Pool } from 'pg';

const pool: Pool = new pg.Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: parseFloat(process.env.PGPORT ?? '5432') ?? 5432,
});

export default pool;
