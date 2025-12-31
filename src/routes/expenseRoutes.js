const express = require('express');
const router = express.Router();
const expenseCtrl = require('../controllers/expenseController');

router.post('/', expenseCtrl.createExpense);          // เพิ่มรายจ่าย
router.get('/', expenseCtrl.getAllExpenses);         // ดูรายจ่ายทั้งหมด (รองรับ ?branchId=xxx)
router.get('/:id', expenseCtrl.getExpenseById);       // ดูรายจ่ายรายตัว
router.put('/:id', expenseCtrl.updateExpense);        // แก้ไขรายจ่าย
router.delete('/:id', expenseCtrl.deleteExpense);     // ลบรายจ่าย

module.exports = router;