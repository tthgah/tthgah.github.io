// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const secretKey = 'your_jwt_secret_key_very_secret_and_long'; // Đảm bảo key này đủ mạnh và giống trong auth.js backend

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(401).json({ message: 'Không có token xác thực. Vui lòng đăng nhập.' });
    }

    const token = authHeader.split(' ')[1]; // Lấy phần token sau "Bearer "

    if (!token) {
        return res.status(401).json({ message: 'Token không hợp lệ.' });
    }

    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            console.error('JWT verification error:', err);
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Token đã hết hạn. Vui lòng đăng nhập lại.' });
            }
            return res.status(403).json({ message: 'Token không hợp lệ hoặc đã bị thay đổi.' });
        }
        req.user = user; // Gán thông tin người dùng vào req.user
        next();
    });
};

module.exports = verifyToken;