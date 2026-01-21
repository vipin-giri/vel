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
        const existingUsers = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );

        if (existingUsers.rows.length > 0) {
            return res.status(400).json({
                success: false,
                error: 'User already exists with this email'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const result = await pool.query(
            'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
            [email, hashedPassword]
        );

        // Generate JWT token
        const token = jwt.sign(
            { userId: result.rows[0].id.toString(), email, role: 'user' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Get created user
        const users = await pool.query(
            'SELECT id, email, nickname, full_name, role, created_at FROM users WHERE id = $1',
            [result.rows[0].id]
        );

        res.status(201).json({
            success: true,
            data: {
                user: {
                    ...users.rows[0],
                    id: users.rows[0].id.toString()
                },
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
        const users = await pool.query(
            'SELECT id, email, password, nickname, full_name, role FROM users WHERE email = $1',
            [email]
        );

        if (users.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password'
            });
        }

        const user = users.rows[0];

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
            { userId: user.id.toString(), email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Remove password from response
        delete user.password;

        res.json({
            success: true,
            data: {
                user: {
                    ...user,
                    id: user.id.toString()
                },
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
        
        const users = await pool.query(
            'SELECT id, email, nickname, full_name, about, experience, role, created_at, updated_at FROM users WHERE id = $1',
            [parseInt(decoded.userId)]
        );

        if (users.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'User not found'
            });
        }

        res.json({
            success: true,
            data: {
                ...users.rows[0],
                id: users.rows[0].id.toString()
            }
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

        await pool.query(
            'UPDATE users SET nickname = $1, full_name = $2, about = $3, experience = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
            [nickname, fullName, about, experience, parseInt(decoded.userId)]
        );

        const users = await pool.query(
            'SELECT id, email, nickname, full_name, about, experience, role, created_at, updated_at FROM users WHERE id = $1',
            [parseInt(decoded.userId)]
        );

        res.json({
            success: true,
            data: {
                ...users.rows[0],
                id: users.rows[0].id.toString()
            }
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
