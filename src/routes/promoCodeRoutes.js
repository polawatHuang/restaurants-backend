const express = require('express');
const router = express.Router();
const promoCtrl = require('../controllers/promoCodeController');

router.post('/', promoCtrl.createPromoCode);         // เพิ่มโค้ด
router.get('/', promoCtrl.getAllPromoCodes);        // ดูโค้ดทั้งหมด
router.get('/:id', promoCtrl.getPromoCodeById);      // ดูโค้ดรายตัว
router.put('/:id', promoCtrl.updatePromoCode);       // แก้ไขโค้ด
router.delete('/:id', promoCtrl.deletePromoCode);    // ลบโค้ด

module.exports = router;