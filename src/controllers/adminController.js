const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// --- Branch Management ---
exports.createBranch = async (req, res) => {
  const { name, address } = req.body;
  const id = uuidv4();
  await pool.query('INSERT INTO Branch (id, name, address) VALUES (?, ?, ?)', [id, name, address]);
  res.status(201).json({ id, name });
};

// --- Financial Summary & AI Analysis ---
exports.getFinancialSummary = async (req, res) => {
  const { branchId } = req.params;
  try {
    const [[revenue]] = await pool.query('SELECT SUM(netAmount) as total FROM Order WHERE branchId = ? AND status = "COMPLETED"', [branchId]);
    const [[expenses]] = await pool.query('SELECT SUM(amount) as total FROM Expense WHERE branchId = ?', [branchId]);
    
    // AI Integration
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `ในฐานะที่ปรึกษาธุรกิจ: สาขามีรายได้ ${revenue.total || 0} และค่าใช้จ่าย ${expenses.total || 0}. แนะนำวิธีประหยัดงบ 3 ข้อ.`;
    const result = await model.generateContent(prompt);

    res.json({ 
      revenue: revenue.total || 0, 
      expenses: expenses.total || 0, 
      profit: (revenue.total || 0) - (expenses.total || 0),
      aiAdvice: result.response.text() 
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// --- HR: Expense Recording ---
exports.addExpense = async (req, res) => {
  const { branchId, amount, type } = req.body;
  const id = uuidv4();
  await pool.query('INSERT INTO Expense (id, branchId, amount, type, date) VALUES (?, ?, ?, ?, NOW())', 
    [id, branchId, amount, type]);
  res.status(201).json({ id });
};