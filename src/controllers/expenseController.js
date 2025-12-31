const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// 1. CREATE - บันทึกค่าใช้จ่ายใหม่
exports.createExpense = async (req, res) => {
    const { branchId, amount, type, description, salaryPaymentId } = req.body;
    // type: 'INGREDIENTS', 'SALARY', 'WATER', 'ELECTRICITY', 'GAS', 'RENT', 'OTHER'
    const id = uuidv4();
    try {
        await pool.query(
            'INSERT INTO Expense (id, branchId, amount, type, description, salaryPaymentId, date) VALUES (?, ?, ?, ?, ?, ?, NOW(3))',
            [
                id, 
                branchId, 
                amount, 
                type, 
                description || null, 
                salaryPaymentId || null, // เชื่อมโยงกับตาราง SalaryPayment ถ้ามี
            ]
        );
        res.status(201).json({ id, branchId, amount, type });
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถบันทึกค่าใช้จ่ายได้", error: err.message });
    }
};

// 2. READ ALL - ดูรายการค่าใช้จ่ายทั้งหมด (กรองตามสาขาได้)
exports.getAllExpenses = async (req, res) => {
    const { branchId } = req.query;
    try {
        let sql = 'SELECT * FROM Expense';
        let params = [];

        if (branchId) {
            sql += ' WHERE branchId = ?';
            params.push(branchId);
        }

        sql += ' ORDER BY date DESC';
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. READ ONE - ดูรายละเอียดรายจ่ายตาม ID
exports.getExpenseById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM Expense WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: "ไม่พบรายการค่าใช้จ่าย" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. UPDATE - แก้ไขข้อมูลรายจ่าย
exports.updateExpense = async (req, res) => {
    const { id } = req.params;
    const { amount, type, description, branchId } = req.body;
    try {
        await pool.query(
            `UPDATE Expense SET 
                amount = COALESCE(?, amount), 
                type = COALESCE(?, type), 
                description = COALESCE(?, description),
                branchId = COALESCE(?, branchId)
             WHERE id = ?`,
            [amount, type, description, branchId, id]
        );
        res.json({ message: "อัปเดตข้อมูลค่าใช้จ่ายสำเร็จ" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. DELETE - ลบรายการรายจ่าย
exports.deleteExpense = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM Expense WHERE id = ?', [id]);
        res.json({ message: "ลบรายการค่าใช้จ่ายเรียบร้อยแล้ว" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};