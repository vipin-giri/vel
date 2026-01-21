const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://root:xn81u6AgdEtkODXnPq9SeSncoQMdj5sj@dpg-d5oa46fgi27c73eifbeg-a.oregon-postgres.render.com/vulnreport_db',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

module.exports = pool;
