const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// 1. CREATE - เพิ่มเมนูอาหารใหม่
exports.createMenuItem = async (req, res) => {
    const { categoryId, branchId, name, description, price, image, isAvailable } = req.body;
    const id = uuidv4();
    try {
        await pool.query(
            'INSERT INTO MenuItem (id, categoryId, branchId, name, description, price, image, isAvailable) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                id, 
                categoryId, 
                branchId, 
                name, 
                description || null, 
                price, 
                image || null, 
                isAvailable !== undefined ? isAvailable : true
            ]
        );
        res.status(201).json({ id, name, price, isAvailable: true });
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถเพิ่มเมนูอาหารได้", error: err.message });
    }
};

// 2. READ ALL - ดึงเมนูทั้งหมด (รองรับการกรองตามสาขา หรือ หมวดหมู่)
exports.getAllMenuItems = async (req, res) => {
    const { branchId, categoryId } = req.query;
    try {
        let sql = 'SELECT * FROM MenuItem WHERE 1=1';
        let params = [];

        if (branchId) {
            sql += ' AND branchId = ?';
            params.push(branchId);
        }
        if (categoryId) {
            sql += ' AND categoryId = ?';
            params.push(categoryId);
        }

        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. READ ONE - ดูรายละเอียดเมนูตาม ID
exports.getMenuItemById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM MenuItem WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: "ไม่พบเมนูอาหาร" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. UPDATE - แก้ไขข้อมูลเมนู (รวมถึงการเปิด/ปิด สถานะอาหารหมด)
exports.updateMenuItem = async (req, res) => {
    const { id } = req.params;
    const { categoryId, branchId, name, description, price, image, isAvailable } = req.body;
    try {
        await pool.query(
            `UPDATE MenuItem SET 
                categoryId = COALESCE(?, categoryId), 
                branchId = COALESCE(?, branchId), 
                name = COALESCE(?, name), 
                description = COALESCE(?, description), 
                price = COALESCE(?, price), 
                image = COALESCE(?, image), 
                isAvailable = COALESCE(?, isAvailable) 
             WHERE id = ?`,
            [categoryId, branchId, name, description, price, image, isAvailable, id]
        );
        res.json({ message: "อัปเดตข้อมูลเมนูอาหารสำเร็จ" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. DELETE - ลบเมนูอาหาร
exports.deleteMenuItem = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM MenuItem WHERE id = ?', [id]);
        res.json({ message: "ลบเมนูอาหารออกจากระบบเรียบร้อยแล้ว" });
    } catch (err) {
        res.status(500).json({ 
            message: "ไม่สามารถลบได้ เนื่องจากเมนูนี้อาจถูกสั่งไปแล้วในอดีต", 
            error: err.message 
        });
    }
};