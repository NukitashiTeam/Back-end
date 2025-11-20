/* AUTO-TAG: User */
const express = require('express');
const router = express.Router();

const UserController = require('../Controller/UserController');

// Gán controller vào router

/**
 * @swagger
 * /api/user/users:
 *   get:
 *     tags:
 *       - User
 *     summary: Kiểm tra tất cả người dùng trong hệ thống 
 *     description: Kiểm tra thông tin cá nhân của người dùng trong hệ thống bao gồm cả mật khẩu
 *     responses:
 *       200:
 *         description: Dữ liệu preview cho một user cụ thể 
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Dữ liệu preview
 *                 preview:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       400:
 *         description: Thiếu keyword
 *       500:
 *         description: Server Error
 */
router.get('/users', UserController.getAllUsers);

/**
 * @swagger
 * /api/user/user/{id}:
 *   get:
 *     tags:
 *       - User
 *     summary: Lấy thông tin chi tiết người dùng theo ID
 *     description: Trả về thông tin một user cụ thể (không bao gồm password và refreshToken)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId của user
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Thông tin người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     provider:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isVerified:
 *                       type: boolean
 *                     lastLogin:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Không tìm thấy người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy người dùng"
 *       500:
 *         description: Lỗi server
 */
router.get('/user/:id', UserController.getUserById);

/**
 * @swagger
 * /api/user/create:
 *   post:
 *     tags:
 *       - User
 *     summary: Tạo người dùng mới
 *     description: Đăng ký user mới với các phương thức phone, Google hoặc Facebook
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider
 *               - name
 *             properties:
 *               provider:
 *                 type: string
 *                 enum: [phone, google, facebook]
 *                 description: Phương thức đăng ký
 *                 example: "phone"
 *               phone:
 *                 type: string
 *                 description: Số điện thoại (bắt buộc nếu provider = phone)
 *                 example: "0912345678"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email (bắt buộc nếu provider = google hoặc facebook)
 *                 example: "user@example.com"
 *               name:
 *                 type: string
 *                 description: Tên người dùng
 *                 example: "Nguyễn Văn A"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mật khẩu (cho provider = phone)
 *                 example: "password123"
 *               avatar:
 *                 type: string
 *                 description: URL ảnh đại diện
 *                 example: "https://example.com/avatar.jpg"
 *               role:
 *                 type: string
 *                 description: Vai trò của user
 *                 default: "user"
 *                 example: "user"
 *           examples:
 *             phoneRegistration:
 *               summary: Đăng ký bằng số điện thoại
 *               value:
 *                 provider: "phone"
 *                 phone: "0912345678"
 *                 name: "Nguyễn Văn A"
 *                 password: "password123"
 *             googleRegistration:
 *               summary: Đăng ký bằng Google
 *               value:
 *                 provider: "google"
 *                 email: "user@gmail.com"
 *                 name: "Nguyễn Văn B"
 *                 avatar: "https://lh3.googleusercontent.com/..."
 *             facebookRegistration:
 *               summary: Đăng ký bằng Facebook
 *               value:
 *                 provider: "facebook"
 *                 email: "user@facebook.com"
 *                 name: "Nguyễn Văn C"
 *                 avatar: "https://graph.facebook.com/..."
 *     responses:
 *       201:
 *         description: Tạo người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Tạo người dùng thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     provider:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isVerified:
 *                       type: boolean
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc user đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Số điện thoại hoặc email đã được đăng ký"
 *       500:
 *         description: Lỗi server
 */
router.post('/user', UserController.createUser);

/**
 * @swagger
 * /api/user/sign-up:
 *   post:
 *     tags:
 *       - User
 *     summary: Đăng ký người dùng mới
 *     description: Đăng ký user mới với các phương thức- tạm thời kiểm tra phương thức
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider
 *               - name
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Số điện thoại (bắt buộc nếu provider = phone)
 *                 example: "0912345678"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email (bắt buộc nếu provider = google hoặc facebook)
 *                 example: "user@example.com"
 *               username:
 *                 type: string
 *                 description: Tên người dùng
 *                 example: "Nguyễn Văn A"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mật khẩu (cho provider = phone)
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Tạo người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Tạo người dùng thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     name:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isVerified:
 *                       type: boolean
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc user đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Số điện thoại hoặc email đã được đăng ký"
 *       500:
 *         description: Lỗi server
 */
router.post('/sign-up', UserController.userSignUp);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     tags:
 *       - User
 *     summary: Người dùng đăng nhập vào hệ thống
 *     description: Người dùng đăng nhập vào hệ thống với các phương thức- tạm thời kiểm tra phương thức
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - provider
 *               - name
 *             properties:
 *               username:
 *                 type: string
 *                 description: Tên người dùng
 *                 example: "Nguyễn Văn A"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mật khẩu (cho provider = phone)
 *                 example: "password123"
 *     responses:
 *       201:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "chào mừng đăng nhập thành công"
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc user đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Số điện thoại hoặc email đã được đăng ký"
 *       500:
 *         description: Lỗi server
 */
router.post('/login', UserController.userLogin);

/**
 * @swagger
 * /api/user/update/{id}:
 *   put:
 *     tags:
 *       - User
 *     summary: Cập nhật thông tin người dùng
 *     description: Cập nhật các thông tin của user (phone, email, name, password, avatar, role, isVerified)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId của user cần cập nhật
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 description: Số điện thoại mới
 *                 example: "0987654321"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email mới
 *                 example: "newemail@example.com"
 *               name:
 *                 type: string
 *                 description: Tên mới
 *                 example: "Nguyễn Văn B"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mật khẩu mới (sẽ được hash tự động)
 *                 example: "newpassword123"
 *               avatar:
 *                 type: string
 *                 description: URL ảnh đại diện mới
 *                 example: "https://example.com/new-avatar.jpg"
 *               role:
 *                 type: string
 *                 description: Vai trò mới
 *                 example: "admin"
 *               isVerified:
 *                 type: boolean
 *                 description: Trạng thái xác thực
 *                 example: true
 *           examples:
 *             updateProfile:
 *               summary: Cập nhật thông tin cơ bản
 *               value:
 *                 name: "Nguyễn Văn B"
 *                 avatar: "https://example.com/new-avatar.jpg"
 *             updatePassword:
 *               summary: Đổi mật khẩu
 *               value:
 *                 password: "newpassword123"
 *             updateRole:
 *               summary: Thay đổi vai trò (admin only)
 *               value:
 *                 role: "admin"
 *                 isVerified: true
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Cập nhật người dùng thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                     provider:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     email:
 *                       type: string
 *                     name:
 *                       type: string
 *                     avatar:
 *                       type: string
 *                     role:
 *                       type: string
 *                     isVerified:
 *                       type: boolean
 *       400:
 *         description: Số điện thoại hoặc email đã được sử dụng
 *       404:
 *         description: Không tìm thấy người dùng
 *       500:
 *         description: Lỗi server
 */
router.put('/user/:id', UserController.updateUser);

/**
 * @swagger
 * /api/user/delete/{id}:
 *   delete:
 *     tags:
 *       - User
 *     summary: Xóa người dùng
 *     description: Xóa vĩnh viễn một user khỏi database theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId của user cần xóa
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Xóa người dùng thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Xóa người dùng thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "507f1f77bcf86cd799439011"
 *                     name:
 *                       type: string
 *                       example: "Nguyễn Văn A"
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-20T11:09:00.000Z"
 *       404:
 *         description: Không tìm thấy người dùng
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy người dùng"
 *       500:
 *         description: Lỗi server
 */
router.delete('/user/:id', UserController.deleteUser);

module.exports = router;