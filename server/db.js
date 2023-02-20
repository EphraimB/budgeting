const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config({ override: true });

const pool = new Pool({
    user: process.env.USER,
    host: process.env.HOST,
    database: process.env.DB,
    password: process.env.PASSWORD,
    port: process.env.PORT,
});

module.exports = pool;