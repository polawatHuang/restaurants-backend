const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// 1. CREATE - เพิ่มโปรโมชั่นโค้ดใหม่
exports.createPromoCode = async (req, res) => {
    const { branchId, code, discountType, value, minOrderAmount, expiresAt, isActive } = req.body;
    const id = uuidv4();
    try {
        await pool.query(
            'INSERT INTO PromoCode (id, branchId, code, discountType, value, minOrderAmount, expiresAt, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [
                id, 
                branchId || null, // ถ้าเป็น NULL หมายถึงใช้ได้ทุกสาขา (Global)
                code, 
                discountType, // 'PERCENTAGE' หรือ 'FIXED_AMOUNT'
                value, 
                minOrderAmount || 0, 
                expiresAt, 
                isActive !== undefined ? isActive : true
            ]
        );
        res.status(201).json({ id, code, discountType, value });
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถสร้างโปรโมชั่นโค้ดได้", error: err.message });
    }
};

// 2. READ ALL - ดึงข้อมูลโค้ดทั้งหมด (กรองตามสาขาได้)
exports.getAllPromoCodes = async (req, res) => {
    const { branchId } = req.query;
    try {
        let sql = 'SELECT * FROM PromoCode';
        let params = [];
        
        if (branchId) {
            sql += ' WHERE branchId = ? OR branchId IS NULL'; // ดึงทั้งของสาขาและ Global
            params.push(branchId);
        }
        
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. READ ONE - ดูรายละเอียดโค้ดตาม ID
exports.getPromoCodeById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM PromoCode WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: "ไม่พบโปรโมชั่นโค้ด" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. UPDATE - แก้ไขข้อมูลโปรโมชั่นโค้ด
exports.updatePromoCode = async (req, res) => {
    const { id } = req.params;
    const { branchId, code, discountType, value, minOrderAmount, expiresAt, isActive } = req.body;
    try {
        await pool.query(
            `UPDATE PromoCode SET 
                branchId = COALESCE(?, branchId), 
                code = COALESCE(?, code), 
                discountType = COALESCE(?, discountType), 
                value = COALESCE(?, value), 
                minOrderAmount = COALESCE(?, minOrderAmount), 
                expiresAt = COALESCE(?, expiresAt), 
                isActive = COALESCE(?, isActive) 
             WHERE id = ?`,
            [branchId, code, discountType, value, minOrderAmount, expiresAt, isActive, id]
        );
        res.json({ message: "อัปเดตโปรโมชั่นโค้ดสำเร็จ" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. DELETE - ลบโปรโมชั่นโค้ด
exports.deletePromoCode = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM PromoCode WHERE id = ?', [id]);
        res.json({ message: "ลบโปรโมชั่นโค้ดเรียบร้อยแล้ว" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};