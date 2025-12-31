const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// 1. CREATE - สร้างคำขอเรียกพนักงานจากลูกค้า
exports.createRequest = async (req, res) => {
    const { tableId, type, note } = req.body; 
    // type: 'UTENSILS', 'SEASONING', 'REFILL', 'OTHER'
    const id = uuidv4();
    try {
        await pool.query(
            'INSERT INTO ServiceRequest (id, tableId, type, note, status, createdAt) VALUES (?, ?, ?, ?, ?, NOW(3))',
            [id, tableId, type, note || null, 'PENDING']
        );

        // เมื่อมีการเรียก ให้เปลี่ยนสถานะโต๊ะเป็น NEED_HELP ทันที เพื่อให้แอดมินเห็นใน Dashboard
        await pool.query('UPDATE `Table` SET status = "NEED_HELP" WHERE id = ?', [tableId]);

        res.status(201).json({ id, tableId, type, status: 'PENDING' });
    } catch (err) {
        res.status(500).json({ message: "ไม่สามารถส่งคำขอได้", error: err.message });
    }
};

// 2. READ ALL - ดูรายการเรียกพนักงานทั้งหมด (เรียงตามล่าสุด)
exports.getAllRequests = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT sr.*, t.number as tableNumber 
            FROM ServiceRequest sr 
            JOIN \`Table\` t ON sr.tableId = t.id 
            ORDER BY sr.createdAt DESC
        `);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. READ BY TABLE - ดูคำขอที่ยังค้างอยู่ของโต๊ะนั้นๆ
exports.getPendingByTable = async (req, res) => {
    const { tableId } = req.params;
    try {
        const [rows] = await pool.query(
            'SELECT * FROM ServiceRequest WHERE tableId = ? AND status != "COMPLETED"',
            [tableId]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 4. UPDATE STATUS - พนักงานรับเรื่องหรือจัดการเสร็จสิ้น
exports.updateRequestStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'IN_PROGRESS', 'COMPLETED'
    try {
        await pool.query('UPDATE ServiceRequest SET status = ? WHERE id = ?', [status, id]);

        // หากจัดการเสร็จสิ้น (COMPLETED) ให้ตรวจสอบว่าโต๊ะนั้นมีคำขออื่นค้างอยู่ไหม
        if (status === 'COMPLETED') {
            const [[check]] = await pool.query(
                'SELECT id FROM ServiceRequest WHERE tableId = (SELECT tableId FROM ServiceRequest WHERE id = ?) AND status != "COMPLETED"',
                [id]
            );
            
            // ถ้าไม่มีคำขออื่นค้างแล้ว ให้เปลี่ยนสถานะโต๊ะกลับเป็น OCCUPIED (หรือ AVAILABLE ตามสถานะออเดอร์)
            if (!check) {
                await pool.query(
                    'UPDATE `Table` SET status = "OCCUPIED" WHERE id = (SELECT tableId FROM ServiceRequest WHERE id = ?)',
                    [id]
                );
            }
        }
        
        res.json({ message: "อัปเดตสถานะการให้บริการสำเร็จ" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 5. DELETE - ลบประวัติคำขอ
exports.deleteRequest = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM ServiceRequest WHERE id = ?', [id]);
        res.json({ message: "ลบรายการเรียบร้อยแล้ว" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};