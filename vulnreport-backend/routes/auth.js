const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

const router = express.Router();

// Register validation rules
const registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    })
];

// Login validation rules
const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required')
];

// Register new user
router.post('/signup', registerValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: errors.array()[0].msg
            });
        }

        const { email, password } = req.body;

        // Check if user already exists
        const [existingUsers] = await pool.execute(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'User already exists with this email'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const [result] = await pool.execute(
            'INSERT INTO users (email, password) VALUES (?, ?)',
            [email, hashedPassword]
        );

        // Generate JWT token
        const token = jwt.sign(
            { userId: result.insertId, email, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Get created user
        const [users] = await pool.execute(
            'SELECT id, email, nickname, full_name, role, created_at FROM users WHERE id = ?',
            [result.insertId]
        );

        res.status(201).json({
            success: true,
            data: {
                user: users[0],
                token
            }
        });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Login user
router.post('/login', loginValidation, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: errors.array()[0].msg
            });
        }

        const { email, password } = req.body;

        // Find user
        const [users] = await pool.execute(
            'SELECT id, email, password, nickname, full_name, role FROM users WHERE email = ?',
            [email]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const user = users[0];

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Remove password from response
        delete user.password;

        res.json({
            success: true,
            data: {
                user,
                token
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const [users] = await pool.execute(
            'SELECT id, email, nickname, full_name, about, experience, role, created_at, updated_at FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(401).json({
            success: false,
            error: 'Invalid token'
        });
    }
});

// Complete profile
router.post('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Token required'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const { nickname, fullName, about, experience, acceptTerms } = req.body;

        if (!acceptTerms) {
            return res.status(400).json({
                success: false,
                error: 'Terms and conditions must be accepted'
            });
        }

        await pool.execute(
            'UPDATE users SET nickname = ?, full_name = ?, about = ?, experience = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [nickname, fullName, about, experience, decoded.userId]
        );

        const [users] = await pool.execute(
            'SELECT id, email, nickname, full_name, about, experience, role, created_at, updated_at FROM users WHERE id = ?',
            [decoded.userId]
        );

        res.json({
            success: true,
            data: users[0]
        });
    } catch (error) {
        console.error('Profile completion error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;
