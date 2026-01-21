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
        const [users] = await pool.execute(
            'SELECT id, email, nickname, full_name, role FROM users WHERE id = ?',
            [decoded.userId]
        );

        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid token' 
            });
        }

        req.user = users[0];
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            error: 'Invalid or expired token' 
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
