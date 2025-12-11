const express = require('express');
const router = express.Router();

const MoodController = require('../Controller/MoodController');

/**
 * @swagger
 * /api/mood/all:
 *   get:
 *     tags:
 *       - Mood
 *     summary: Lấy danh sách tất cả các Mood
 *     description: Trả về toàn bộ danh sách Mood, sắp xếp theo thời gian tạo mới nhất trước
 *     responses:
 *       200:
 *         description: Lấy danh sách Mood thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lấy danh sách Mood thành công
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Mood'
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lỗi server
 *                 error:
 *                   type: string
 */
router.get('/all', MoodController.getAllMoods);

/**
 * @swagger
 * /api/mood/name/{name}:
 *   get:
 *     tags:
 *       - Mood
 *     summary: Tìm Mood theo tên
 *     description: Tìm các Mood có tên chứa chuỗi được cung cấp (không phân biệt hoa thường)
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Tên Mood cần tìm
 *         example: vui
 *     responses:
 *       200:
 *         description: Lấy được Mood theo tên
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lấy được mood theo tên
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Mood'
 *       400:
 *         description: Thiếu tham số name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Thiếu tham số name
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lỗi server
 *                 error:
 *                   type: string
 */
router.get('/name/:name', MoodController.getMoodByName);

/**
 * @swagger
 * /api/mood/id/{mood_id}:
 *   get:
 *     tags:
 *       - Mood
 *     summary: Lấy thông tin chi tiết Mood theo ID
 *     description: Trả về thông tin một Mood cụ thể theo MongoDB ObjectId
 *     parameters:
 *       - in: path
 *         name: mood_id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId của Mood
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Lấy Mood thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lấy được mood theo id
 *                 data:
 *                   $ref: '#/components/schemas/Mood'
 *       404:
 *         description: Không tìm thấy Mood
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Không tìm thấy mood
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Lỗi server
 *                 error:
 *                   type: string
 */
router.get('/id/:mood_id', MoodController.getMoodById);

/**
 * @swagger
 * /api/mood/mood-type:
 *   post:
 *     summary: Thêm mood mới vào hệ thống
 *     description: Tạo một mood mới với các thông tin cơ bản (name, displayName, description, colorCode, icon)
 *     tags:
 *       - Mood
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - displayName
 *               - colorCode
 *             properties:
 *               name:
 *                 type: string
 *                 description: Tên mood (lowercase, dùng làm key). VD happy, sad, energetic
 *                 example: happy
 *               displayName:
 *                 type: string
 *                 description: Tên hiển thị (Title Case, có thể có dấu). VD Happy, Vui vẻ
 *                 example: Happy
 *               description:
 *                 type: string
 *                 description: Mô tả ngắn về mood
 *                 example: Vui vẻ, phấn khởi, tích cực
 *               colorCode:
 *                 type: string
 *                 pattern: '^#[0-9A-Fa-f]{6}$'
 *                 description: Mã màu hex đại diện cho mood (format #RRGGBB)
 *                 example: '#FFD700'
 *               icon:
 *                 type: string
 *                 description: Emoji hoặc icon đại diện
 *                 example: 😊
 *     responses:
 *       201:
 *         description: Mood được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mood created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     _id:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *                     name:
 *                       type: string
 *                       example: happy
 *                     displayName:
 *                       type: string
 *                       example: Happy
 *                     description:
 *                       type: string
 *                       example: Vui vẻ, phấn khởi, tích cực
 *                     colorCode:
 *                       type: string
 *                       example: '#FFD700'
 *                     icon:
 *                       type: string
 *                       example: 😊
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-11-23T00:00:00.000Z
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Validation error
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - name is required
 *                     - colorCode must be valid hex format
 *       409:
 *         description: Mood với name này đã tồn tại
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Mood with name 'happy' already exists
 *       500:
 *         description: Lỗi server
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Server Error
 */
router.post('/mood-type', MoodController.addMoodIntoService);


module.exports = router;