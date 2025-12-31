const express = require('express');
const router = express.Router();
const menuCtrl = require('../controllers/menuItemController');

router.post('/', menuCtrl.createMenuItem);          // เพิ่มเมนู
router.get('/', menuCtrl.getAllMenuItems);         // ดูเมนูทั้งหมด (รองรับ ?branchId=...&categoryId=...)
router.get('/:id', menuCtrl.getMenuItemById);       // ดูรายตัว
router.put('/:id', menuCtrl.updateMenuItem);        // แก้ไขเมนู/สถานะอาหารหมด
router.delete('/:id', menuCtrl.deleteMenuItem);     // ลบเมนู

module.exports = router;