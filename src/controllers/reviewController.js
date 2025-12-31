const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// 1. CREATE - สร้างรีวิวใหม่
exports.createReview = async (req, res) => {
    const { orderId, rating, comment } = req.body;
    const id = uuidv4();
    try {
        // ตรวจสอบว่า Order นี้เคยรีวิวไปหรือยัง (เนื่องจาก 1 Order ควรมี 1 รีวิว)
        const [existing] = await pool.query('SELECT id FROM Review WHERE orderId = ?', [orderId]);
        if (existing.length > 0) return res.status(400).json({ message: "ออเดอร์นี้ถูกรีวิวไปแล้ว" });

        await pool.query(
            'INSERT INTO Review (id, orderId, rating, comment, createdAt) VALUES (?, ?, ?, ?, NOW(3))',
            [id, orderId, rating, comment]
        );
        res.status(201).json({ id, orderId, rating, message: "บันทึกรีวิวสำเร็จ" });
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถบันทึกรีวิวได้", error: err.message });
    }
};

// 2. READ ALL - ดึงรีวิวทั้งหมด (สำหรับ Admin)
exports.getAllReviews = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Review ORDER BY createdAt DESC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. READ BY BRANCH - ดึงรีวิวแยกตามสาขา (ใช้ Join กับตาราง Order)
exports.getReviewsByBranch = async (req, res) => {
    const { branchId } = req.params;
    try {
        const [rows] = await pool.query(
            `SELECT r.*, o.tableId, o.totalAmount 
             FROM Review r 
             JOIN \`Order\` o ON r.orderId = o.id 
             WHERE o.branchId = ? 
             ORDER BY r.createdAt DESC`,
            [branchId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. READ ONE - ดูรายละเอียดรีวิวตาม ID
exports.getReviewById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM Review WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: "ไม่พบรีวิว" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. UPDATE - แก้ไขรีวิว (หากจำเป็น)
exports.updateReview = async (req, res) => {
    const { id } = req.params;
    const { rating, comment } = req.body;
    try {
        await pool.query(
            'UPDATE Review SET rating = COALESCE(?, rating), comment = COALESCE(?, comment) WHERE id = ?',
            [rating, comment, id]
        );
        res.json({ message: "อัปเดตรีวิวสำเร็จ" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 6. DELETE - ลบรีวิว
exports.deleteReview = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM Review WHERE id = ?', [id]);
        res.json({ message: "ลบรีวิวเรียบร้อยแล้ว" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};