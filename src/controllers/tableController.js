const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// 1. CREATE - เพิ่มโต๊ะใหม่ในสาขา
exports.createTable = async (req, res) => {
    const { branchId, number } = req.body; // number เช่น "A1", "B5"
    const id = uuidv4();
    try {
        await pool.query(
            'INSERT INTO `Table` (id, branchId, number, status) VALUES (?, ?, ?, ?)',
            [id, branchId, number, 'AVAILABLE']
        );
        res.status(201).json({ id, branchId, number, status: 'AVAILABLE' });
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถสร้างโต๊ะได้", error: err.message });
    }
};

// 2. READ ALL - ดูโต๊ะทั้งหมด (กรองตามสาขาได้)
exports.getAllTables = async (req, res) => {
    const { branchId } = req.query; // รับค่าจาก Query String เช่น ?branchId=xxx
    try {
        let sql = 'SELECT * FROM `Table`';
        let params = [];

        if (branchId) {
            sql += ' WHERE branchId = ?';
            params.push(branchId);
        }

        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถดึงข้อมูลโต๊ะได้", error: err.message });
    }
};

// 3. READ ONE - ดูสถานะโต๊ะรายตัว
exports.getTableById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM `Table` WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: "ไม่พบโต๊ะที่ระบุ" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
};

// 4. UPDATE - แก้ไขเลขโต๊ะหรือสถานะ (เช่น พนักงานกดเคลียร์โต๊ะ)
exports.updateTable = async (req, res) => {
    const { id } = req.params;
    const { number, status, currentOrderId } = req.body;
    try {
        // อัปเดตข้อมูลตามที่ส่งมา (Dynamic Update)
        await pool.query(
            'UPDATE `Table` SET number = COALESCE(?, number), status = COALESCE(?, status), currentOrderId = COALESCE(?, currentOrderId) WHERE id = ?',
            [number, status, currentOrderId, id]
        );
        res.json({ message: "อัปเดตสถานะโต๊ะสำเร็จ" });
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถอัปเดตข้อมูลได้", error: err.message });
    }
};

// 5. DELETE - ลบโต๊ะออกจากระบบ
exports.deleteTable = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM `Table` WHERE id = ?', [id]);
        res.json({ message: "ลบโต๊ะเรียบร้อยแล้ว" });
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถลบได้ เนื่องจากโต๊ะอาจมีออเดอร์ค้างอยู่", error: err.message });
    }
};