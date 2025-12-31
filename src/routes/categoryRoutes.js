const express = require('express');
const router = express.Router();
const categoryCtrl = require('../controllers/categoryController');

router.post('/', categoryCtrl.createCategory);        // เพิ่มหมวดหมู่
router.get('/', categoryCtrl.getAllCategories);       // ดูทั้งหมด
router.get('/:id', categoryCtrl.getCategoryById);     // ดูรายตัว
router.put('/:id', categoryCtrl.updateCategory);      // แก้ไขชื่อ
router.delete('/:id', categoryCtrl.deleteCategory);   // ลบหมวดหมู่

module.exports = router;