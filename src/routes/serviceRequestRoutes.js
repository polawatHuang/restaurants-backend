const express = require('express');
const router = express.Router();
const serviceCtrl = require('../controllers/serviceRequestController');

router.post('/', serviceCtrl.createRequest);              // ลูกค้ากดเรียก
router.get('/', serviceCtrl.getAllRequests);             // แอดมินดูคำขอทั้งหมด
router.get('/table/:tableId', serviceCtrl.getPendingByTable); // ดูคำขอรายโต๊ะ
router.put('/:id', serviceCtrl.updateRequestStatus);      // พนักงานรับเรื่อง/ปิดงาน
router.delete('/:id', serviceCtrl.deleteRequest);        // ลบข้อมูล

module.exports = router;