-- VulnReport Pro Database Schema
-- Create database
CREATE DATABASE IF NOT EXISTS vulnreport_db;
USE vulnreport_db;

-- Users table
CREATE TABLE users (
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
);

-- Vulnerability reports table
CREATE TABLE vulnerability_reports (
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
);

-- Report attachments table
CREATE TABLE report_attachments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    report_id INT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size INT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (report_id) REFERENCES vulnerability_reports(id) ON DELETE CASCADE
);

-- Insert default admin user
INSERT INTO users (email, password, nickname, full_name, role, about, experience) VALUES 
('vipingiribgb0@gmail.com', '$2b$10$YourHashedPasswordHere', 'admin', 'VulnReport Admin', 'admin', 'System administrator for VulnReport Pro', 'Experienced security professional and platform administrator');

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_reports_user_id ON vulnerability_reports(user_id);
CREATE INDEX idx_reports_status ON vulnerability_reports(status);
CREATE INDEX idx_reports_submitted_at ON vulnerability_reports(submitted_at);
