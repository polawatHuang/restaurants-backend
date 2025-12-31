const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/userController');

router.post('/', userCtrl.createUser);        // Create
router.get('/', userCtrl.getAllUsers);       // Read All
router.get('/:id', userCtrl.getUserById);     // Read One
router.put('/:id', userCtrl.updateUser);      // Update
router.delete('/:id', userCtrl.deleteUser);   // Delete

module.exports = router;