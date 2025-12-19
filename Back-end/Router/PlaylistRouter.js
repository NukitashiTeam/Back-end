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

/**
 * @swagger
 * /api/playlist/user:
 *   get:
 *     tags:
 *       - Playlist
 *     summary: Lấy tất cả playlist của người dùng
 *     description: >
 *       Trả về danh sách tất cả playlist thuộc về người dùng đang đăng nhập.
 *       ID người dùng được lấy từ authentication token (req.user).
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lấy danh sách playlist thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Playlist'
 *       401:
 *         description: Truy cập bị từ chối. Không có token.
 *       403:
 *         description: Token không hợp lệ hoặc đã hết hạn.
 *       500:
 *         description: Lỗi server
 */
router.get('/user', authenticationToken, PlaylistController.getAllPlaylistByUser);

/**
 * @swagger
 * /api/playlist/new-music/{playlistId}:
 *   patch:
 *     tags:
 *       - Playlist
 *     summary: Thêm bài hát vào playlist
 *     description: >
 *       Thêm một bài hát vào playlist của người dùng đang đăng nhập.
 *       Người dùng chỉ có thể thêm bài hát vào playlist mà họ sở hữu
 *       và bài hát không được trùng trong playlist.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: playlistId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của playlist
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - musicId
 *             properties:
 *               musicId:
 *                 type: string
 *                 example: 64f12a9c8a3c123456789abc
 *     responses:
 *       200:
 *         description: Thêm bài hát vào playlist thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Playlist'
 *       401:
 *         description: Truy cập bị từ chối. Không có token.
 *       403:
 *         description: Token không hợp lệ hoặc đã hết hạn.
 *       404:
 *         description: Không tìm thấy bài hát hoặc playlist không tồn tại.
 *       500:
 *         description: Lỗi server
 */
router.patch('/new-music/:playlistId', authenticationToken, PlaylistController.addSongIntoPlaylist);

/**
 * @swagger
 * /api/playlist/random-by-mood:
 *   get:
 *     tags:
 *       - Playlist
 *     summary: Lấy danh sách nhạc ngẫu nhiên theo mood (Xem trước - Không lưu DB)
 *     description: >
 *       API này trả về một mảng bài hát ngẫu nhiên dựa trên mood
 *       để người dùng nghe thử trước khi quyết định lưu playlist.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: moodName
 *         required: true
 *         schema:
 *           type: string
 *           example: Vui vẻ
 *     responses:
 *       200:
 *         description: Trả về danh sách bài hát ngẫu nhiên thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 title:
 *                   type: string
 *                   example: Gợi ý mood Vui vẻ
 *                 songs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       songId:
 *                         type: string
 *                         example: 64adbc2f8ee9c9f1b4d9d4d5
 *                       title:
 *                         type: string
 *                         example: Hello
 *                       artist:
 *                         type: string
 *                         example: Adele
 *                 isTemporary:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Thiếu tham số moodName
 *       404:
 *         description: Không tìm thấy bài hát nào phù hợp
 */
router.get('/random-by-mood', authenticationToken, PlaylistController.createArraySongsRandomByMood);

/**
 * @swagger
 * /api/playlist/save-random-mood:
 *   post:
 *     tags:
 *       - Playlist
 *     summary: Lưu danh sách nhạc ngẫu nhiên thành playlist chính thức
 *     description: >
 *       Nhận danh sách bài hát từ kết quả generate-preview
 *       và lưu thành playlist chính thức với owner là người dùng hiện tại.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - songs
 *             properties:
 *               title:
 *                 type: string
 *                 example: My Random Mix
 *               songs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - songId
 *                     - title
 *                     - artist
 *                   properties:
 *                     songId:
 *                       type: string
 *                       example: 64adbc2f8ee9c9f1b4d9d4d5
 *                     title:
 *                       type: string
 *                       example: Hello
 *                     artist:
 *                       type: string
 *                       example: Adele
 *     responses:
 *       201:
 *         description: Lưu playlist thành công
 *       401:
 *         description: Truy cập bị từ chối. Không có token.
 *       500:
 *         description: Lỗi server
 */
router.post('/save-random-mood',authenticationToken, PlaylistController.createRandomPlaylist);



module.exports = router;