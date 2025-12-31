const express = require('express');
const router = express.Router();
const branchCtrl = require('../controllers/branchController');

router.post('/', branchCtrl.createBranch);          // Create
router.get('/', branchCtrl.getAllBranches);         // Read All
router.get('/:id', branchCtrl.getBranchById);       // Read One
router.put('/:id', branchCtrl.updateBranch);        // Update
router.delete('/:id', branchCtrl.deleteBranch);     // Delete

module.exports = router;