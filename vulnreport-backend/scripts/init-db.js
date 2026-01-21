const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const fs = require('fs');
require('dotenv').config();

async function initializeDatabase() {
    const pool = new Pool({
        connectionString: process.env.DATABASE_URL || 'postgresql://root:xn81u6AgdEtkODXnPq9SeSncoQMdj5sj@dpg-d5oa46fgi27c73eifbeg-a.oregon-postgres.render.com/vulnreport_db',
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    const client = await pool.connect();

    try {
        console.log('Connecting to database...');

        // Create users table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                nickname VARCHAR(100),
                full_name VARCHAR(255),
                about TEXT,
                experience TEXT,
                role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create vulnerability_reports table
        await client.query(`
            CREATE TABLE IF NOT EXISTS vulnerability_reports (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL,
                domain VARCHAR(255) NOT NULL,
                affected_url TEXT NOT NULL,
                vulnerability_type VARCHAR(255) NOT NULL,
                steps_to_reproduce TEXT NOT NULL,
                impact TEXT NOT NULL,
                proof_of_concept TEXT,
                admin_comment TEXT,
                status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'on_hold', 'accepted', 'rejected', 'patched')),
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        // Create report_attachments table
        await client.query(`
            CREATE TABLE IF NOT EXISTS report_attachments (
                id SERIAL PRIMARY KEY,
                report_id INTEGER NOT NULL,
                filename VARCHAR(255) NOT NULL,
                original_name VARCHAR(255) NOT NULL,
                file_size INTEGER NOT NULL,
                mime_type VARCHAR(100) NOT NULL,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (report_id) REFERENCES vulnerability_reports(id) ON DELETE CASCADE
            )
        `);

        // Check if admin user exists
        const adminResult = await client.query(
            'SELECT id FROM users WHERE email = $1 AND role = $2',
            ['vipin-giribgb0@gmail.com', 'admin']
        );

        let userCreated = false;
        if (adminResult.rows.length === 0) {
            // Hash the admin password
            const hashedPassword = await bcrypt.hash('word Xyz99@123', 10);

            // Insert default admin user
            await client.query(`
                INSERT INTO users (email, password, nickname, full_name, role, about, experience)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
            `, [
                'vipin-giribgb0@gmail.com',
                hashedPassword,
                'admin',
                'VulnReport Admin',
                'admin',
                'System administrator for VulnReport Pro',
                'Experienced security professional and platform administrator'
            ]);

            console.log('✅ Default admin user created successfully!');
            console.log('📧 Email: vipin-giribgb0@gmail.com');
            console.log('🔑 Password: word Xyz99@123');
            userCreated = true;
        } else {
            console.log('✅ Admin user already exists');
        }

        // Create indexes
        await client.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_reports_user_id ON vulnerability_reports(user_id)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_reports_status ON vulnerability_reports(status)');
        await client.query('CREATE INDEX IF NOT EXISTS idx_reports_submitted_at ON vulnerability_reports(submitted_at)');

        console.log('🎉 Database initialized successfully!');

        // If user was created, destroy this script to prevent further use
        if (userCreated) {
            fs.unlinkSync(__filename);
            console.log('🔒 Initialization script destroyed for security.');
        }

    } catch (error) {
        console.error('❌ Error initializing database:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

initializeDatabase();
