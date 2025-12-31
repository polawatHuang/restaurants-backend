const pool = require('../config/db');

exports.getPendingItems = async (req, res) => {
  const { branchId } = req.params;
  const [items] = await pool.query(
    `SELECT oi.*, o.tableId FROM OrderItem oi 
     JOIN Order o ON oi.orderId = o.id 
     WHERE o.branchId = ? AND oi.status = "PENDING"`, [branchId]);
  res.json(items);
};

exports.updateItemStatus = async (req, res) => {
  const { itemId, status } = req.body; // status: SERVED
  await pool.query('UPDATE OrderItem SET status = ? WHERE id = ?', [status, itemId]);
  res.json({ success: true });
};