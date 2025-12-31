const express = require('express');
const router = express.Router();
const reviewCtrl = require('../controllers/reviewController');

router.post('/', reviewCtrl.createReview);              // ลูกค้าส่งรีวิว
router.get('/', reviewCtrl.getAllReviews);             // แอดมินดูรีวิวทั้งหมด
router.get('/branch/:branchId', reviewCtrl.getReviewsByBranch); // ดูรีวิวเฉพาะสาขา
router.get('/:id', reviewCtrl.getReviewById);           // ดูรีวิวรายตัว
router.put('/:id', reviewCtrl.updateReview);           // แก้ไขรีวิว
router.delete('/:id', reviewCtrl.deleteReview);        // ลบรีวิว

module.exports = router;