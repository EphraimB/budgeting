import pg, { type Pool } from 'pg';

// Get the PostgreSQL NUMERIC OID
const NUMERIC_OID = 1700;

// Register a type parser to convert NUMERIC types to float
pg.types.setTypeParser(NUMERIC_OID, (val: string) => {
    return parseFloat(val);
});

const pool: Pool = new pg.Pool({
    user: process.env.PGUSER,
    host: process.env.PGHOST,
    database: process.env.PGDATABASE,
    password: process.env.PGPASSWORD,
    port: parseFloat(process.env.PGPORT ?? '5432'),
});

export default pool;
