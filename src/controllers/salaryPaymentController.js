const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// 1. CREATE - บันทึกการจ่ายเงินเดือน
exports.createSalaryPayment = async (req, res) => {
    const { userId, amount, periodMonth, periodYear, paymentDate } = req.body;
    const id = uuidv4();
    try {
        await pool.query(
            'INSERT INTO SalaryPayment (id, userId, amount, periodMonth, periodYear, paymentDate) VALUES (?, ?, ?, ?, ?, ?)',
            [
                id, 
                userId, 
                amount, 
                periodMonth, 
                periodYear, 
                paymentDate || new Date() // หากไม่ระบุ ให้ใช้วันที่ปัจจุบัน
            ]
        );
        res.status(201).json({ id, userId, amount, periodMonth, periodYear });
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถบันทึกการจ่ายเงินเดือนได้", error: err.message });
    }
};

// 2. READ ALL - ดูประวัติการจ่ายเงินเดือนทั้งหมด (พร้อมชื่อพนักงาน)
exports.getAllSalaryPayments = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT sp.*, u.name as employeeName 
            FROM SalaryPayment sp 
            JOIN User u ON sp.userId = u.id 
            ORDER BY sp.paymentDate DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. READ ONE - ดูรายละเอียดการจ่ายเงินรายบุคคลตาม ID
exports.getSalaryPaymentById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM SalaryPayment WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: "ไม่พบข้อมูลการจ่ายเงินเดือน" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. UPDATE - แก้ไขข้อมูลการจ่ายเงินเดือน
exports.updateSalaryPayment = async (req, res) => {
    const { id } = req.params;
    const { userId, amount, periodMonth, periodYear, paymentDate } = req.body;
    try {
        await pool.query(
            `UPDATE SalaryPayment SET 
                userId = COALESCE(?, userId), 
                amount = COALESCE(?, amount), 
                periodMonth = COALESCE(?, periodMonth), 
                periodYear = COALESCE(?, periodYear), 
                paymentDate = COALESCE(?, paymentDate) 
             WHERE id = ?`,
            [userId, amount, periodMonth, periodYear, paymentDate, id]
        );
        res.json({ message: "อัปเดตข้อมูลการจ่ายเงินเดือนสำเร็จ" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. DELETE - ลบข้อมูลการจ่ายเงินเดือน
exports.deleteSalaryPayment = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM SalaryPayment WHERE id = ?', [id]);
        res.json({ message: "ลบข้อมูลการจ่ายเงินเดือนเรียบร้อยแล้ว" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};