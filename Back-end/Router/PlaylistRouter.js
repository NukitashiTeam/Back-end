// Router/MusicRouter.js
const express = require('express');
const router = express.Router();

const PlaylistController = require('../Controller/PlaylistController');

const { authenticationToken, generateAccessToken, generateRefreshToken} = require('../Middleware/auth.js')

/**
 * @swagger
 * /api/playlist/manual-playlist:
 *   post:
 *     tags:
 *       - Playlist
 *     summary: Tạo playlist thủ công cho người dùng
 *     description: >
 *       Tạo một playlist mới gắn liền với ID người dùng lấy từ authentication token.
 *       Playlist được tạo mặc định có loại là **manual**.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: Nhạc chill đêm khuya
 *     responses:
 *       201:
 *         description: Tạo playlist thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 playlist:
 *                   $ref: '#/components/schemas/Playlist'
 *       401:
 *         description: Truy cập bị từ chối. Không có token.
 *       403:
 *         description: Token không hợp lệ hoặc đã hết hạn.
 *       500:
 *         description: Lỗi server
 */

router.post('/manual-playlist', authenticationToken, PlaylistController.createPlaylist);

module.exports = router;