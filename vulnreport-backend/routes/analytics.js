const express = require('express');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get analytics data (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        // Get total reports count
        const [totalResult] = await pool.execute(
            'SELECT COUNT(*) as total FROM vulnerability_reports'
        );
        const totalReports = totalResult[0].total;

        // Get reports by status
        const [statusResult] = await pool.execute(`
            SELECT 
                status,
                COUNT(*) as count 
            FROM vulnerability_reports 
            GROUP BY status
        `);

        const statusCounts = {
            pending: 0,
            on_hold: 0,
            accepted: 0,
            rejected: 0,
            patched: 0
        };

        statusResult.forEach(row => {
            statusCounts[row.status] = row.count;
        });

        // Get reports by month (last 6 months)
        const [monthlyResult] = await pool.execute(`
            SELECT 
                DATE_FORMAT(submitted_at, '%Y-%m') as month,
                COUNT(*) as count 
            FROM vulnerability_reports 
            WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(submitted_at, '%Y-%m')
            ORDER BY month ASC
        `);

        // Get reports by vulnerability type
        const [typeResult] = await pool.execute(`
            SELECT 
                vulnerability_type as type,
                COUNT(*) as count 
            FROM vulnerability_reports 
            GROUP BY vulnerability_type 
            ORDER BY count DESC 
            LIMIT 10
        `);

        // Get recent reports
        const [recentResult] = await pool.execute(`
            SELECT 
                vr.*,
                u.email,
                u.nickname 
            FROM vulnerability_reports vr 
            JOIN users u ON vr.user_id = u.id 
            ORDER BY vr.submitted_at DESC 
            LIMIT 5
        `);

        const analytics = {
            totalReports,
            pendingReports: statusCounts.pending,
            acceptedReports: statusCounts.accepted,
            rejectedReports: statusCounts.rejected,
            patchedReports: statusCounts.patched,
            reportsByMonth: monthlyResult,
            reportsByType: typeResult,
            recentReports: recentResult
        };

        res.json({
            success: true,
            data: analytics
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;
