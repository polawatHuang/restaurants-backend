const express = require('express');
const router = express.Router();
const salaryCtrl = require('../controllers/salaryPaymentController');

router.post('/', salaryCtrl.createSalaryPayment);         // บันทึกการจ่ายเงิน
router.get('/', salaryCtrl.getAllSalaryPayments);        // ดูประวัติทั้งหมด
router.get('/:id', salaryCtrl.getSalaryPaymentById);      // ดูรายตัว
router.put('/:id', salaryCtrl.updateSalaryPayment);       // แก้ไขข้อมูล
router.delete('/:id', salaryCtrl.deleteSalaryPayment);    // ลบข้อมูล

module.exports = router;