const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// 1. CREATE - เพิ่มหมวดหมู่ใหม่
exports.createCategory = async (req, res) => {
    const { name } = req.body;
    const id = uuidv4(); // สร้าง ID แบบ unique varchar(191)
    try {
        // ตรวจสอบชื่อซ้ำก่อนบันทึก
        const [existing] = await pool.query('SELECT id FROM Category WHERE name = ?', [name]);
        if (existing.length > 0) return res.status(400).json({ message: "มีหมวดหมู่นี้อยู่แล้ว" });

        await pool.query(
            'INSERT INTO Category (id, name) VALUES (?, ?)',
            [id, name]
        );
        res.status(201).json({ id, name });
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถสร้างหมวดหมู่ได้", error: err.message });
    }
};

// 2. READ ALL - ดูหมวดหมู่ทั้งหมด
exports.getAllCategories = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Category ORDER BY name ASC');
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. READ ONE - ดูรายละเอียดหมวดหมู่ตาม ID
exports.getCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM Category WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: "ไม่พบหมวดหมู่" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. UPDATE - แก้ไขชื่อหมวดหมู่
exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE Category SET name = ? WHERE id = ?',
            [name, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "ไม่พบหมวดหมู่ที่ต้องการแก้ไข" });
        res.json({ message: "อัปเดตชื่อหมวดหมู่สำเร็จ" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. DELETE - ลบหมวดหมู่
exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        // ข้อควรระวัง: หากมี MenuItem ผูกอยู่ จะลบไม่ได้ถ้าตั้ง Foreign Key ไว้
        await pool.query('DELETE FROM Category WHERE id = ?', [id]);
        res.json({ message: "ลบหมวดหมู่เรียบร้อยแล้ว" });
    } catch (err) {
        res.status(500).json({ 
            message: "ไม่สามารถลบได้ เนื่องจากมีเมนูอาหารใช้งานหมวดหมู่นี้อยู่", 
            error: err.message 
        });
    }
};