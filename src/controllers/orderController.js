const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

exports.placeOrder = async (req, res) => {
  const { branchId, tableId, items } = req.body; // items: [{menuItemId, quantity, price, orderedBy}]
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const orderId = uuidv4();
    const total = items.reduce((sum, i) => sum + (i.price * i.quantity), 0);

    // 1. Insert Order
    await conn.query('INSERT INTO Order (id, branchId, tableId, totalAmount, netAmount) VALUES (?, ?, ?, ?, ?)', 
      [orderId, branchId, tableId, total, total]);

    // 2. Insert Order Items
    const values = items.map(i => [uuidv4(), orderId, i.menuItemId, i.quantity, i.price, i.orderedBy]);
    await conn.query('INSERT INTO OrderItem (id, orderId, menuItemId, quantity, unitPrice, orderedBy) VALUES ?', [values]);

    // 3. Update Table Status
    await conn.query('UPDATE Table SET status = "OCCUPIED", currentOrderId = ? WHERE id = ?', [orderId, tableId]);

    await conn.commit();
    res.status(201).json({ orderId });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
};

exports.requestService = async (req, res) => {
  const { tableId, type } = req.body;
  const id = uuidv4();
  await pool.query('INSERT INTO ServiceRequest (id, tableId, type) VALUES (?, ?, ?)', [id, tableId, type]);
  await pool.query('UPDATE Table SET status = "NEED_HELP" WHERE id = ?', [tableId]);
  res.status(201).json({ id });
};