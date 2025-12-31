const express = require('express');
const router = express.Router();
const tableCtrl = require('../controllers/tableController');

router.post('/', tableCtrl.createTable);          // เพิ่มโต๊ะ
router.get('/', tableCtrl.getAllTables);         // ดูโต๊ะทั้งหมด (รองรับ ?branchId=xxx)
router.get('/:id', tableCtrl.getTableById);       // ดูโต๊ะรายตัว
router.put('/:id', tableCtrl.updateTable);        // แก้ไขสถานะโต๊ะ
router.delete('/:id', tableCtrl.deleteTable);     // ลบโต๊ะ

module.exports = router;