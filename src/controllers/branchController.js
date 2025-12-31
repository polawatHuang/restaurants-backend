const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// 1. CREATE - เพิ่มสาขาใหม่
exports.createBranch = async (req, res) => {
    const { name, address } = req.body;
    const id = uuidv4();
    try {
        await pool.query(
            'INSERT INTO Branch (id, name, address, isActive) VALUES (?, ?, ?, ?)',
            [id, name, address, true]
        );
        res.status(201).json({ id, name, address, isActive: true });
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถสร้างสาขาได้", error: err.message });
    }
};

// 2. READ ALL - ดูรายชื่อสาขาทั้งหมด
exports.getAllBranches = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Branch');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถดึงข้อมูลสาขาได้", error: err.message });
    }
};

// 3. READ ONE - ดูข้อมูลสาขาตาม ID
exports.getBranchById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM Branch WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: "ไม่พบสาขาที่ระบุ" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการดึงข้อมูล", error: err.message });
    }
};

// 4. UPDATE - แก้ไขข้อมูลสาขา
exports.updateBranch = async (req, res) => {
    const { id } = req.params;
    const { name, address, isActive } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE Branch SET name = ?, address = ?, isActive = ? WHERE id = ?',
            [name, address, isActive, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "ไม่พบสาขาที่ต้องการแก้ไข" });
        res.json({ message: "อัปเดตข้อมูลสาขาสำเร็จ" });
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถอัปเดตข้อมูลได้", error: err.message });
    }
};

// 5. DELETE - ลบสาขา (Hard Delete)
exports.deleteBranch = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM Branch WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: "ไม่พบสาขาที่ต้องการลบ" });
        res.json({ message: "ลบสาขาออกจากระบบเรียบร้อยแล้ว" });
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถลบสาขาได้เนื่องจากมีข้อมูลเชื่อมโยงอยู่", error: err.message });
    }
};