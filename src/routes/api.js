const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const order = require('../controllers/orderController');
const kitchen = require('../controllers/kitchenController');

// Admin & HR
router.post('/branches', admin.createBranch);
router.get('/finance/:branchId', admin.getFinancialSummary);
router.post('/expenses', admin.addExpense);

// Customer
router.post('/orders', order.placeOrder);
router.post('/service-request', order.requestService);

// Kitchen
router.get('/kitchen/:branchId', kitchen.getPendingItems);
router.patch('/kitchen/item', kitchen.updateItemStatus);

module.exports = router;