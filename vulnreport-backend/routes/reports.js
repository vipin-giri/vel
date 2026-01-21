const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/* ========================= MULTER CONFIG ========================= */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

/* ========================= VALIDATION ========================= */
const reportValidation = [
  body('domain').notEmpty().withMessage('Domain is required'),
  body('affected_url').custom(value => {
    if (!value) throw new Error('Affected URL is required');
    try {
      const url = new URL(value);
      if (!['http:', 'https:'].includes(url.protocol)) {
        throw new Error();
      }
      return true;
    } catch {
      throw new Error('Please enter a valid URL');
    }
  }),
  body('vulnerability_type').notEmpty().withMessage('Vulnerability type is required'),
  body('steps_to_reproduce').notEmpty().withMessage('Steps are required'),
  body('impact').notEmpty().withMessage('Impact is required')
];

/* ========================= CREATE REPORT ========================= */
router.post(
  '/',
  authenticateToken,
  upload.array('attachments', 5),
  reportValidation,
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: errors.array()[0].msg
        });
      }

      const {
        domain,
        affected_url,
        vulnerability_type,
        steps_to_reproduce,
        impact,
        proof_of_concept
      } = req.body;
      const userId = req.user.id;

      // Debug logging
      console.log('Received form data:', { domain, affected_url, vulnerability_type, steps_to_reproduce, impact, proof_of_concept });
      console.log('User ID:', userId);

      // Duplicate check (24h)
      const [existing] = await pool.execute(
        'SELECT submitted_at FROM vulnerability_reports WHERE domain = ? AND affected_url = ?',
        [domain, affected_url]
      );

      if (existing.length) {
        const hoursDiff = (Date.now() - new Date(existing[0].submitted_at)) / 36e5;
        if (hoursDiff < 24) {
          return res.status(400).json({
            success: false,
            duplicate: true,
            error: 'Duplicate report. Please wait 24 hours.'
          });
        }
      }

      // INSERT REPORT - FIXED: Remove attachments column (handled separately)
      const [result] = await pool.execute(
        `INSERT INTO vulnerability_reports 
         (user_id, domain, affected_url, vulnerability_type, steps_to_reproduce, impact, proof_of_concept) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          domain || null,
          affected_url || null,
          vulnerability_type || null,
          steps_to_reproduce || null,
          impact || null,
          proof_of_concept || null
        ]
      );

      // INSERT ATTACHMENTS
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          await pool.execute(
            `INSERT INTO report_attachments 
             (report_id, filename, original_name, file_size, mime_type) 
             VALUES (?, ?, ?, ?, ?)`,
            [
              result.insertId,
              file.filename,
              file.originalname,
              file.size,
              file.mimetype
            ]
          );
        }
      }

      res.status(201).json({ success: true, reportId: result.insertId });
    } catch (err) {
      console.error('CREATE REPORT ERROR:', err);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
);

/* ========================= USER REPORTS ========================= */
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const [reports] = await pool.execute(
      `SELECT vr.*, u.email, u.nickname, u.full_name 
       FROM vulnerability_reports vr 
       JOIN users u ON vr.user_id = u.id 
       WHERE vr.user_id = ? 
       ORDER BY vr.submitted_at DESC`,
      [req.user.id]
    );
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.json({ success: true, data: reports });
  } catch (err) {
    console.error('GET USER REPORTS ERROR:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/* ========================= ALL REPORTS (ADMIN) ========================= */
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [reports] = await pool.execute(
      `SELECT vr.id, vr.user_id, vr.domain, vr.affected_url, vr.vulnerability_type, vr.steps_to_reproduce, vr.impact, vr.proof_of_concept, vr.status, vr.admin_comment, vr.submitted_at, vr.updated_at, u.email, u.nickname, u.full_name 
       FROM vulnerability_reports vr 
       JOIN users u ON vr.user_id = u.id 
       ORDER BY vr.submitted_at DESC`
    );
    const formattedReports = reports.map(report => ({
      ...report,
      submittedAt: report.submitted_at,
      updatedAt: report.updated_at,
      userId: report.user_id,
      fullName: report.full_name,
      adminComment: report.admin_comment,
      proofOfConcept: report.proof_of_concept,
      vulnerabilityType: report.vulnerability_type,
      stepsToReproduce: report.steps_to_reproduce,
      affectedUrl: report.affected_url
    }));
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.json({ success: true, data: formattedReports });
  } catch (err) {
    console.error('GET ALL REPORTS ERROR:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/* ========================= SINGLE REPORT ========================= */
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const [reports] = await pool.execute(
      `SELECT vr.id, vr.user_id, vr.domain, vr.affected_url, vr.vulnerability_type, vr.steps_to_reproduce, vr.impact, vr.proof_of_concept, vr.status, vr.admin_comment, vr.submitted_at, vr.updated_at, u.email, u.nickname, u.full_name 
       FROM vulnerability_reports vr 
       JOIN users u ON vr.user_id = u.id 
       WHERE vr.id = ?`,
      [req.params.id]
    );

    if (!reports.length) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    const report = reports[0];

    // Authorization check: only owner or admin can view
    if (report.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get attachments
    const [attachments] = await pool.execute(
      `SELECT id, filename, original_name, file_size, mime_type, uploaded_at 
       FROM report_attachments 
       WHERE report_id = ?`,
      [req.params.id]
    );

    report.attachments = attachments;
    
    const formattedReport = {
      ...report,
      submittedAt: report.submitted_at,
      updatedAt: report.updated_at,
      userId: report.user_id,
      fullName: report.full_name,
      adminComment: report.admin_comment,
      proofOfConcept: report.proof_of_concept,
      vulnerabilityType: report.vulnerability_type,
      stepsToReproduce: report.steps_to_reproduce,
      affectedUrl: report.affected_url
    };

    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.json({ success: true, data: formattedReport });
  } catch (err) {
    console.error('GET SINGLE REPORT ERROR:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});
/* ========================= UPDATE REPORT STATUS ========================= */
router.patch('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status, adminComment } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    // Valid statuses (matching database schema)
    const validStatuses = ['pending', 'on_hold', 'accepted', 'rejected', 'patched'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status value'
      });
    }

    const [result] = await pool.execute(
      `UPDATE vulnerability_reports 
       SET status = ?, admin_comment = ?, updated_at = NOW() 
       WHERE id = ?`,
      [status, adminComment || null, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    // Return updated report with user info
    const [updatedReport] = await pool.execute(
      `SELECT vr.id, vr.user_id, vr.domain, vr.affected_url as affectedUrl, vr.vulnerability_type as vulnerabilityType, vr.steps_to_reproduce as stepsToReproduce, vr.impact, vr.proof_of_concept as proofOfConcept, vr.status, vr.admin_comment as adminComment, vr.submitted_at, vr.updated_at, u.email, u.nickname, u.full_name as fullName 
       FROM vulnerability_reports vr 
       JOIN users u ON vr.user_id = u.id 
       WHERE vr.id = ?`,
      [req.params.id]
    );

    const formattedReport = {
      ...updatedReport[0],
      submittedAt: updatedReport[0].submitted_at,
      updatedAt: updatedReport[0].updated_at,
      userId: updatedReport[0].user_id,
      fullName: updatedReport[0].full_name,
      adminComment: updatedReport[0].admin_comment,
      proofOfConcept: updatedReport[0].proof_of_concept,
      vulnerabilityType: updatedReport[0].vulnerability_type,
      stepsToReproduce: updatedReport[0].steps_to_reproduce,
      affectedUrl: updatedReport[0].affected_url
    };

    res.json({
      success: true,
      message: 'Report status updated successfully',
      data: formattedReport
    });
  } catch (error) {
    console.error('UPDATE STATUS ERROR:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/* ========================= DELETE REPORT ========================= */
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Get report to check ownership
    const [reports] = await pool.execute(
      'SELECT user_id FROM vulnerability_reports WHERE id = ?',
      [req.params.id]
    );

    if (!reports.length) {
      return res.status(404).json({
        success: false,
        error: 'Report not found'
      });
    }

    // Authorization: only owner or admin can delete
    if (reports[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Get attachments to delete files
    const [attachments] = await pool.execute(
      'SELECT filename FROM report_attachments WHERE report_id = ?',
      [req.params.id]
    );

    // Delete attachment files
    for (const att of attachments) {
      const filePath = path.join('uploads', att.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete from database (CASCADE should handle attachments if FK is set)
    await pool.execute(
      'DELETE FROM vulnerability_reports WHERE id = ?',
      [req.params.id]
    );

    res.json({
      success: true,
      message: 'Report deleted successfully'
    });
  } catch (err) {
    console.error('DELETE REPORT ERROR:', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;