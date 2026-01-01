// @ts-nocheck
const User = require('../Model/UserSchema');
const jwt = require('jsonwebtoken');

exports.authenticationToken = (req, res, next) => {
    // Lấy Header Authorization (ví dụ: 'Bearer <token>')
    const authHeader = req.headers['authorization']; 
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: "Truy cập bị từ chối. Không có token." });
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        // Kiểm tra lỗi (Token không hợp lệ hoặc đã hết hạn)
        if (err) {
            return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
        }
        req.user = user;
        next();
    });
};

// Hàm tạo Access Token
const genAccessToken = (user) => {
    return jwt.sign(
        { _id: user._id, role: user.role}, 
        process.env.ACCESS_TOKEN_SECRET, // Đảm bảo đã định nghĩa trong .env
        { expiresIn: '30s' } 
    );
};

// Hàm tạo Refresh Token
const genRefreshToken = (user) => {
    return jwt.sign(
        { _id: user._id, role: user.role}, 
        process.env.REFRESH_TOKEN_SECRET, // Đảm bảo đã định nghĩa trong .env
        { expiresIn: '7d' } 
    );
};

exports.generateAccessToken = genAccessToken;
exports.generateRefreshToken = genRefreshToken;


// Hàm request Refresh Token
exports.requestRefreshToken = async (req, res) => {
    // 1. Lấy Refresh Token từ cookies
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "Truy cập bị từ chối. Không có Refresh Token." });
    }

    try {
        const user = await User.findOne({ refreshToken: refreshToken });
        
        if (!user) {
            // Nếu không tìm thấy user hoặc Refresh Token không khớp, xóa cookie (để tránh tấn công)
            res.clearCookie('refreshToken', { 
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                path: '/',
                sameSite: 'strict',
            });
            return res.status(403).json({ message: "Refresh Token không hợp lệ. Vui lòng đăng nhập lại." });
        }

        // 3. Xác minh Refresh Token (kiểm tra hết hạn và chữ ký)
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) {
                // Refresh Token hết hạn hoặc không hợp lệ, xóa token trong DB và cookie
                user.refreshToken = null;
                user.save();

                res.clearCookie('refreshToken', {
                    httpOnly: true, 
                    secure: process.env.NODE_ENV === 'production', 
                    path: '/',
                    sameSite: 'strict',
                });
                return res.status(403).json({ message: "Refresh Token đã hết hạn. Vui lòng đăng nhập lại." });
            }

            // 4. Tạo Access Token MỚI và Refresh Token MỚI
            const newAccessToken = genAccessToken(user);
            const newRefreshToken = genRefreshToken(user);

            // 5. Lưu Refresh Token MỚI vào DB
            user.refreshToken = newRefreshToken;
            user.save();

            // 6. Gửi Access Token MỚI qua response body và Refresh Token MỚI qua cookie
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true, 
                secure: process.env.NODE_ENV === 'production', 
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
                path: '/',
                sameSite: 'strict',
            });

            return res.status(200).json({ 
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                message: "Cấp Access Token mới thành công" 
            });
        });

    } catch (err) {
        console.error("Lỗi khi Refresh Token:", err);
        return res.status(500).json({ message: "Lỗi server khi Refresh Token", error: err});
    }
};

// Middleware kiểm tra quyền Admin
exports.verifyAdmin = (req, res, next) => {
    // authenticationToken đã chạy trước đó nên req.user đã có dữ liệu
    if (req.user && req.user.role === 'admin') {
        next(); // Là admin -> Cho qua
    } else {
        return res.status(403).json({ message: "Truy cập bị từ chối. Yêu cầu quyền Admin." });
    }
};