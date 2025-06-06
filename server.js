const express = require('express');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());
app.use(cors());

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'braunen',
    password: '1234',
    port: 5432,
});

const accessCodes = new Map();
const JWT_SECRET = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IlF1YW4gQnVpIiwiaWF0IjoxNTE2MjM5MDIyfQ.3I2YkQ8S6N7069Jz-ZI_saVtnugluY9wPm-4pj-mauM';

// Middleware để kiểm tra device_id
const checkDeviceId = (req, res, next) => {
    const { device_id } = req.body;
    if (!device_id) {
        return res.status(400).json({ error: 'Device ID is required' });
    }
    next();
};


// I) API liên quan đến kiểm tra thông tin người dùng
// Kiểm tra username
app.post('/check-username', checkDeviceId, async (req, res) => {
    const { username, device_id } = req.body;
    
    try {
        const result = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Username not found' });
        }
        // Tạo access code
        const accessCode = uuidv4();
        const expiresAt = Date.now() + 5 * 60 * 1000; // Hết hạn sau 5 phút
     
        // Lưu access code với user_id và device_id
        accessCodes.set(accessCode, {
            user_id: result.rows[0].id,
            device_id,
            expiresAt,
        });

        res.json({ 
            message: 'Username found',
            access_code: accessCode 
        });
    } catch (error) {
        console.error('Error checking username:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
// Kiểm tra password, deviceID và accesscode 
app.post('/check-password', checkDeviceId, async (req, res) => {
    const { access_code, password, device_id } = req.body;
    const accessData = accessCodes.get(access_code);
    if (!accessData) {
        return res.status(400).json({ error: 'Invalid or expired access code' });
    }
    if (Date.now() > accessData.expiresAt) {
        accessCodes.delete(access_code);
        return res.status(400).json({ error: 'Access code expired' });
    }
    if (accessData.device_id !== device_id) {
        return res.status(400).json({ error: 'Invalid device ID' });
    }

    try {
        const result = await pool.query('SELECT password, username FROM users WHERE id = $1', [accessData.user_id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (password !== result.rows[0].password) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        accessCodes.delete(access_code);
        const token = jwt.sign(
            { user_id: accessData.user_id, username: result.rows[0].username },
            JWT_SECRET,
            { expiresIn: '1h' } // Token hết hạn sau 1 giờ
        );

        res.json({ 
            message: 'Login successful',
            user_id: accessData.user_id,
            token
        });
    } catch (error) {
        console.error('Error checking password:', error);
        res.status(500).json({ error: 'Server error' });
    }
});
//Duy trì đăng nhập
app.get('/verify-session', (req, res) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Invalid or missing Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    if (!token || token.split('.').length !== 3) {
        return res.status(401).json({ error: 'Malformed token' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ 
            message: 'Session valid',
            user: {
                user_id: decoded.user_id,
                username: decoded.username
            }
        });
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).json({ error: 'Invalid or expired token' });
    }
});
//Đăng xuất
app.post('/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});


//II) API liên quan đến đối tác
// Xem tất cả các đối tác
app.get('/partners', async (req, res) => {
    try {
      const result = await pool.query('SELECT id, ten, diachi, sodienthoai FROM Partner');
      res.json(result.rows);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
});
// Tạo một đối tác mới
app.post('/partners', async (req, res) => {
    const { ten, diachi, sodienthoai } = req.body;
    try {
      const result = await pool.query(
        'INSERT INTO Partner (ten, diachi, sodienthoai) VALUES ($1, $2, $3) RETURNING *',
        [ten, diachi, sodienthoai]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create partner' });
    }
});
// Chỉnh sửa thông tin của đối tác 
app.put('/partners/:id', async (req, res) => {
    const { id } = req.params;
    const { ten, diachi, sodienthoai } = req.body;
    try {
      const result = await pool.query(
        'UPDATE Partner SET ten = $1, diachi = $2, sodienthoai = $3 WHERE id = $4 RETURNING *',
        [ten, diachi, sodienthoai, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Partner not found' });
      }
      res.json(result.rows[0]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to update partner' });
    }
});

app.delete('/partners/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('DELETE FROM Partner WHERE id = $1 RETURNING *', [id]);
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Partner not found' });
      }
      res.json({ message: 'Partner deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to delete partner' });
    }
});

//API liên quan đến quản lý nhân sự
//Xem tất cả các nhân sự
app.get('/employees', async (req, res) => {
    try {
      const result = await pool.query(`
            SELECT NhanSu.*, Partner.Ten AS TenDoiTac
            FROM NhanSu
            LEFT JOIN Partner ON NhanSu.PartnerID = Partner.ID
        `);
      res.json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

//Thêm nhân sự mới
app.post('/employees', async (req, res) => {
    try {
      const { ten, sodienthoai, diachi, partnerid } = req.body;
      const result = await pool.query(
        'INSERT INTO NhanSu (Ten, SoDienThoai, DiaChi, PartnerID) VALUES ($1, $2, $3, $4) RETURNING *',
        [ten, sodienthoai, diachi, partnerid]
      );
      res.status(201).json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

//Cập nhật thông tin nhân sự
app.put('/employees/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const { ten, sodienthoai, diachi, partnerid } = req.body;
      const result = await pool.query(
        'UPDATE NhanSu SET Ten = $1, SoDienThoai = $2, DiaChi = $3, PartnerID = $4 WHERE ID = $5 RETURNING *',
        [ten, sodienthoai, diachi, partnerid, id]
      );
      if (result.rows.length === 0) return res.status(404).json({ error: 'Nhân sự không tồn tại' });
      res.json(result.rows[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

app.delete('/employees/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM NhanSu WHERE ID = $1 RETURNING *', [id]);
      if (result.rows.length === 0) return res.status(404).json({ error: 'Nhân sự không tồn tại' });
      res.json({ message: 'Nhân sự đã được xóa' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});