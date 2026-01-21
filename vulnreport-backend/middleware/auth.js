const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            error: 'Access token required' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Get user from database
        const users = await pool.query(
            'SELECT id, email, nickname, full_name, role FROM users WHERE id = $1',
            [parseInt(decoded.userId)]
        );

        if (users.rows.length === 0) {
            return res.status(401).json({ 
                success: false, 
                error: 'User not found' 
            });
        }

        req.user = {
            ...users.rows[0],
            id: users.rows[0].id.toString()
        };
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                success: false, 
                error: 'Token expired' 
            });
        }
        return res.status(403).json({ 
            success: false, 
            error: 'Invalid token' 
        });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            success: false, 
            error: 'Admin access required' 
        });
    }
    next();
};

module.exports = { authenticateToken, requireAdmin };
