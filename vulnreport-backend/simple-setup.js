const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function simpleSetup() {
    let connection;
    
    try {
        console.log('🔄 Connecting to MySQL...');
        
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306
        });

        console.log('✅ Connected to MySQL server');
        
        // Create database
        await connection.query('CREATE DATABASE IF NOT EXISTS vulnreport_db');
        console.log('✅ Database vulnreport_db created');
        
        // Close and reconnect with database
        await connection.end();
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: 'vulnreport_db',
            port: process.env.DB_PORT || 3306
        });
        console.log('✅ Connected to vulnreport_db database');
        
        // Create users table
        const createUsersTable = `
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                nickname VARCHAR(100),
                full_name VARCHAR(255),
                about TEXT,
                experience TEXT,
                role ENUM('user', 'admin') DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        `;
        await connection.query(createUsersTable);
        console.log('✅ Users table created');
        
        // Create vulnerability_reports table
        const createReportsTable = `
            CREATE TABLE IF NOT EXISTS vulnerability_reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                domain VARCHAR(255) NOT NULL,
                affected_url TEXT NOT NULL,
                vulnerability_type VARCHAR(255) NOT NULL,
                steps_to_reproduce TEXT NOT NULL,
                impact TEXT NOT NULL,
                proof_of_concept TEXT,
                admin_comment TEXT,
                status ENUM('pending', 'on_hold', 'accepted', 'rejected', 'patched') DEFAULT 'pending',
                submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `;
        await connection.query(createReportsTable);
        console.log('✅ Vulnerability reports table created');
        
        // Create report_attachments table
        const createAttachmentsTable = `
            CREATE TABLE IF NOT EXISTS report_attachments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                report_id INT NOT NULL,
                filename VARCHAR(255) NOT NULL,
                original_name VARCHAR(255) NOT NULL,
                file_size INT NOT NULL,
                mime_type VARCHAR(100) NOT NULL,
                uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (report_id) REFERENCES vulnerability_reports(id) ON DELETE CASCADE
            )
        `;
        await connection.query(createAttachmentsTable);
        console.log('✅ Report attachments table created');
        
        // Check if admin user exists
        const [adminUsers] = await connection.query(
            'SELECT id FROM users WHERE email = ? AND role = ?',
            ['vipingiribgb0@gmail.com', 'admin']
        );

        if (adminUsers.length === 0) {
            // Hash the admin password
            const hashedPassword = await bcrypt.hash('Xyz99@123', 10);
            console.log('🔐 Hashed admin password');
            
            // Insert default admin user
            await connection.query(
                'INSERT INTO users (email, password, nickname, full_name, role, about, experience) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [
                    'vipingiribgb0@gmail.com',
                    hashedPassword,
                    'admin',
                    'VulnReport Admin',
                    'admin',
                    'System administrator for VulnReport Pro',
                    'Experienced security professional and platform administrator'
                ]
            );
            
            console.log('✅ Default admin user created successfully!');
            console.log('📧 Email: vipingiribgb0@gmail.com');
            console.log('🔑 Password: Xyz99@123');
        } else {
            console.log('✅ Admin user already exists');
        }

        // Create indexes
        await connection.query('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
        await connection.query('CREATE INDEX IF NOT EXISTS idx_reports_user_id ON vulnerability_reports(user_id)');
        await connection.query('CREATE INDEX IF NOT EXISTS idx_reports_status ON vulnerability_reports(status)');
        await connection.query('CREATE INDEX IF NOT EXISTS idx_reports_submitted_at ON vulnerability_reports(submitted_at)');
        console.log('✅ Indexes created');

        console.log('🎉 Database setup completed successfully!');
        console.log('🌐 Backend is ready to use!');
        
    } catch (error) {
        console.error('❌ Database setup error:', error.message);
        
        if (error.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log('💡 Solution: Check your MySQL credentials in .env file');
            console.log('   - Make sure DB_USER and DB_PASSWORD are correct');
        }
        
        if (error.code === 'ECONNREFUSED') {
            console.log('💡 Solution: Make sure MySQL/XAMPP is running');
            console.log('   - Start MySQL service in XAMPP Control Panel');
        }
        
    } finally {
        if (connection) {
            await connection.end();
            console.log('🔌 Database connection closed');
        }
    }
}

simpleSetup();
