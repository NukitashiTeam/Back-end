/* AUTO-TAG: User */
const express = require('express');
const router = express.Router();

const UserController = require('../Controller/UserController');
const { authenticationToken, generateAccessToken, generateRefreshToken} = require('../Middleware/auth.js')

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
router.get('/user/:id', authenticationToken, UserController.getUserById);

/**
 * @swagger
 * /api/user/self:
 *   get:
 *     tags:
 *       - User
 *     summary: Lấy thông tin người dùng hiện tại
 *     description: Trả về dữ liệu user dựa trên access token (không bao gồm password, refreshToken và __v).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy dữ liệu người dùng thành công
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
 *                   example: "Lấy dữ liệu người dùng thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: "67a0bc123f1d932d1a45b9f0"
 *                     username:
 *                       type: string
 *                       example: johndoe
 *                     email:
 *                       type: string
 *                       example: johndoe@gmail.com
 *                     name:
 *                       type: string
 *                       example: John Doe
 *                     role:
 *                       type: string
 *                       example: user
 *                     avatar:
 *                       type: string
 *                       example: "https://example.com/avatar.png"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-05T10:20:30.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-01-10T11:00:00.000Z"
 *
 *       401:
 *         description: Không có token hoặc token không hợp lệ
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
 *                   example: "Token không hợp lệ hoặc đã hết hạn"
 *
 *       404:
 *         description: Người dùng không tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 */
router.get('/self', authenticationToken, UserController.readUser);

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
 * /api/user/signup:
 *   post:
 *     tags:
 *       - User
 *     summary: Đăng ký tài khoản mới
 *     description: Đăng ký tài khoản người dùng mới, kiểm tra trùng username/email/phone, gửi OTP xác thực về email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *               - phone
 *             properties:
 *               username:
 *                 type: string
 *                 description: Tên người dùng
 *                 example: "NguyenVanA"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Email đăng ký
 *                 example: "user@example.com"
 *               phone:
 *                 type: string
 *                 description: Số điện thoại đăng ký
 *                 example: "0912345678"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mật khẩu đăng ký
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Đăng ký thành công, vui lòng xác thực OTP
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
 *                   example: "User registered successfully, please verify OTP sent to your email"
 *                 data:
 *                   type: object
 *       400:
 *         description: Tên, số điện thoại hoặc email đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Username đã tồn tại"
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "lỗi server"
 */
router.post('/signup', UserController.userSignUp);

/**
 * @swagger
 * /api/user/signup/step1:
 *   post:
 *     summary: Bước 1 - Tạo tài khoản, nhập username và password
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: testuser
 *               password:
 *                 type: string
 *                 example: password123
 *               passwordConfirm:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Thành công - Chuyển sang bước tiếp theo
 *       400:
 *         description: Lỗi xác thực
 */
router.post('/signup/step1', UserController.signUpStepOne);


//router.post('/signup/step2', UserController.signUpStepTwo);

/**
 * @swagger
 * /api/user/signup/step2:
 *   post:
 *     summary: Bước 2 - Điền thông tin liên lạc để nhận OTP
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               contact:
 *                 type: string
 *                 example: test@example.com
 *     responses:
 *       200:
 *         description: Đã gửi OTP
 *       400:
 *         description: Lỗi xác thực
 */
router.post('/signup/step2', UserController.signUpStepTwo);

/**
 * @swagger
 * /api/user/verifyOTP:
 *   post:
 *     tags:
 *       - User
 *     summary: Xác thực OTP người dùng
 *     description: Xác thực mã OTP để xác minh tài khoản người dùng (hoàn tất đăng ký hoặc khôi phục bảo mật).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - otp
 *             properties:
 *               otp:
 *                 type: string
 *                 description: Mã OTP gửi về email
 *                 example: "6969"
 *     responses:
 *       200:
 *         description: Xác thực thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Tài khoản đã được xác thực, xin mời đăng nhập"
 *       400:
 *         description: Dữ liệu không hợp lệ hoặc OTP sai/hết hạn/user chưa tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP không hợp lệ hoặc đã hết hạn"
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Xảy ra lỗi khi xác thực OTP"
 */
router.post('/verifyOTP', UserController.verifyOTP);

/**
 * @swagger
 * /api/user/resendOTP:
 *   post:
 *     tags:
 *       - User
 *     summary: Gửi lại mã OTP qua email
 *     description: Tạo và gửi lại mã OTP mới để xác thực tài khoản (chỉ user chưa xác minh).
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Gửi OTP thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "OTP đã được gửi lại thành công"
 *       400:
 *         description: Dữ liệu không hợp lệ, user chưa tồn tại hoặc đã xác thực
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy user hoặc tài khoản đã được xác thực"
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Xảy ra lỗi khi gửi lại OTP"
 */
router.post('/resendOTP', UserController.resendOTP);

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     tags:
 *       - User
 *     summary: Đăng nhập hệ thống
 *     description: Đăng nhập bằng username và password, kiểm tra trạng thái xác thực tài khoản.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Tên người dùng
 *                 example: "NguyenVanA"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: Mật khẩu
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Đăng nhập thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "chào mừng đăng nhập NguyenVanA"
 *                 data:
 *                   type: object
 *       401:
 *         description: Mật khẩu không đúng hoặc tài khoản chưa xác thực
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Mật khẩu không đúng"
 *       404:
 *         description: Không tìm thấy user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Không tìm thấy user"
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "lỗi server"
 */
router.post('/login', UserController.userLogin);

/**
 * @swagger
 * /api/user/logout:
 *   post:
 *     tags:
 *       - User
 *     summary: Đăng xuất người dùng
 *     description: Đăng xuất tài khoản khỏi hệ thống, hủy session hiện tại.
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: Đăng xuất thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đăng xuất thành công"
 *       500:
 *         description: Lỗi khi đăng xuất
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Lỗi khi đăng xuất"
 */
router.post('/logout', UserController.userLogout);

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