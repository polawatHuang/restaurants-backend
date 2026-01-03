const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// 1. REGISTER (Public) - For customers registering themselves
// Forces role to 'CUSTOMER' and ignores sensitive fields
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // 1. Check if email exists
        const [existing] = await pool.query('SELECT id FROM User WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });

        // 2. Encrypt password & Generate ID
        const id = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 3. Insert into DB (Force role = CUSTOMER)
        await pool.query(
            'INSERT INTO User (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)',
            [id, name, email, hashedPassword, 'CUSTOMER']
        );

        res.status(201).json({ 
            message: "สมัครสมาชิกสำเร็จ",
            user: { id, name, email, role: 'CUSTOMER' }
        });

    } catch (err) {
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการสมัครสมาชิก", error: err.message });
    }
};

// 2. LOGIN - Authenticate user
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        // 1. Find user by email
        const [rows] = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
        if (rows.length === 0) {
            return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
        }

        const user = rows[0];

        // 2. Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
        }

        // 3. Return user info (exclude password)
        res.json({
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            branchId: user.branchId,
            image: user.image || null // Return null if no image
        });

    } catch (err) {
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการเข้าสู่ระบบ", error: err.message });
    }
};

// 3. FORGOT PASSWORD - Simulate reset request
exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        // 1. Check if user exists
        const [rows] = await pool.query('SELECT id FROM User WHERE email = ?', [email]);
        
        if (rows.length === 0) {
            // Security: Don't reveal if email exists or not
            return res.json({ message: "หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว" });
        }

        // TODO: In a real app, you would:
        // 1. Generate a random token (e.g., using crypto)
        // 2. Save token & expiry to DB (requires 'resetToken' column in User table)
        // 3. Send email using Nodemailer

        console.log(`[MOCK EMAIL] Password reset requested for: ${email}`);

        res.json({ message: "หากอีเมลนี้มีอยู่ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปให้แล้ว" });

    } catch (err) {
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
};

// 1. CREATE - เพิ่มผู้ใช้งานใหม่ (Register)
exports.createUser = async (req, res) => {
    const { branchId, name, email, password, role } = req.body;
    try {
        // ตรวจสอบว่าอีเมลซ้ำหรือไม่
        const [existing] = await pool.query('SELECT id FROM User WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: "อีเมลนี้ถูกใช้งานแล้ว" });

        const id = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO User (id, branchId, name, email, password, role) VALUES (?, ?, ?, ?, ?, ?)',
            [id, branchId || null, name, email, hashedPassword, role || 'CUSTOMER']
        );

        res.status(201).json({ id, name, email, role });
    } catch (err) {
        res.status(500).json({ message: "เกิดข้อผิดพลาดในการสร้าง User", error: err.message });
    }
};

// 2. READ ALL - ดูผู้ใช้งานทั้งหมด (แสดงชื่อสาขาด้วย)
exports.getAllUsers = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT u.id, u.name, u.email, u.role, u.branchId, b.name as branchName 
            FROM User u 
            LEFT JOIN Branch b ON u.branchId = b.id
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถดึงข้อมูลได้", error: err.message });
    }
};

// 3. READ ONE - ดูข้อมูลรายบุคคล
exports.getUserById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT id, branchId, name, email, role FROM User WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ message: "เกิดข้อผิดพลาด", error: err.message });
    }
};

// 4. UPDATE - แก้ไขข้อมูล
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, branchId } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE User SET name = ?, email = ?, role = ?, branchId = ? WHERE id = ?',
            [name, email, role, branchId, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: "ไม่พบผู้ใช้งาน" });
        res.json({ message: "อัปเดตข้อมูลสำเร็จ" });
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถแก้ไขข้อมูลได้", error: err.message });
    }
};

// 5. DELETE - ลบผู้ใช้งาน
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM User WHERE id = ?', [id]);
        res.json({ message: "ลบผู้ใช้งานเรียบร้อยแล้ว" });
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถลบได้", error: err.message });
    }
};