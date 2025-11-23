const express = require('express');
const router = express.Router();

const MoodController = require('../Controller/MoodController');

/**
 * @swagger
 * /api/mood/mood-type:
 *   post:
 *     summary: Thêm mood mới vào hệ thống
 *     description: Tạo một mood mới với các thông tin cơ bản (name, displayName, description, colorCode, icon)
 *     tags:
 *       - Moods
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