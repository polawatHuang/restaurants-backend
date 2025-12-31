const pool = require('../config/db');

exports.getSystemStatus = async (req, res) => {
    const healthcheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: Date.now(),
        system: {
            memoryUsage: process.memoryUsage(),
            platform: process.platform
        },
        database: {
            status: 'UNKNOWN',
            latency: 0
        },
        services: [
            'branches', 'users', 'tables', 'promo-codes', 
            'reviews', 'salary-payments', 'service-requests', 
            'categories', 'expenses', 'menu-items'
        ]
    };

    try {
        const start = Date.now();
        // ทดสอบการเชื่อมต่อ Database ด้วยคำสั่งง่ายๆ
        await pool.query('SELECT 1'); 
        
        healthcheck.database.status = 'CONNECTED';
        healthcheck.database.latency = `${Date.now() - start}ms`;
        
        res.json(healthcheck);
    } catch (err) {
        healthcheck.message = 'CRITICAL';
        healthcheck.database.status = 'DISCONNECTED';
        healthcheck.database.error = err.message;
        
        // ส่งสถานะ 503 (Service Unavailable) หาก Database พัง
        res.status(503).json(healthcheck);
    }
};