const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const fs = require('fs');
require('dotenv').config();

async function initializeDatabase() {
    const connection = await mysql.createConnection({
        host: 'mysql.railway.internal',
        user: 'root',
        password: 'QbrvQFCpSEndFYpyzHiMGJKyasICsKaU',
        database: 'railway',
        port: 3306
    });

    try {
        console.log('Connecting to database...');
        await connection.execute('USE railway');

        // Create users table
        await connection.execute(`
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
        `);

        // Create vulnerability_reports table
        await connection.execute(`
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
        `);

        // Create report_attachments table
        await connection.execute(`
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
        `);

        // Check if admin user exists
        const [adminUsers] = await connection.execute(
            'SELECT id FROM users WHERE email = ? AND role = ?',
            ['vipin-giribgb0@gmail.com', 'admin']
        );

        let userCreated = false;
        if (adminUsers.length === 0) {
            // Hash the admin password
            const hashedPassword = await bcrypt.hash('word Xyz99@123', 10);
            
            // Insert default admin user
            await connection.execute(`
                INSERT INTO users (email, password, nickname, full_name, role, about, experience) 
                VALUES (?, ?, ?, ?, ?, ?, ?)
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
        await connection.execute('CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)');
        await connection.execute('CREATE INDEX IF NOT EXISTS idx_reports_user_id ON vulnerability_reports(user_id)');
        await connection.execute('CREATE INDEX IF NOT EXISTS idx_reports_status ON vulnerability_reports(status)');
        await connection.execute('CREATE INDEX IF NOT EXISTS idx_reports_submitted_at ON vulnerability_reports(submitted_at)');

        console.log('🎉 Database initialized successfully!');

        // If user was created, destroy this script to prevent further use
        if (userCreated) {
            fs.unlinkSync(__filename);
            console.log('🔒 Initialization script destroyed for security.');
        }
        
    } catch (error) {
        console.error('❌ Error initializing database:', error);
    } finally {
        await connection.end();
    }
}

initializeDatabase();
