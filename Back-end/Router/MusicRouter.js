// Router/MusicRouter.js
const express = require('express');
const router = express.Router();

const MusicController = require('../Controller/MusicController');

// Gán controller vào router

//Kiểm tra bài hát trên itunes
/**
 * @swagger
 * /api/music/preview:
 *   get:
 *     tags:
 *       - Music
 *     summary: Kiểm tra bài hát trên iTunes (preview)
 *     description: Tìm kiếm bài hát trên iTunes theo keyword và trả về danh sách preview (chưa lưu vào DB).
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         required: true
 *         
 *       - in: query
 *         name: numberOfsong
 *         schema:
 *           type: integer
 *           example: 10
 *         required: false
 *         description: Số lượng kết quả (limit)
 *     responses:
 *       200:
 *         description: Dữ liệu preview
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
 *                     $ref: '#/components/schemas/Music'
 *       400:
 *         description: Thiếu keyword
 *       500:
 *         description: Server Error
 */
router.get('/preview', MusicController.checkMusicInItunes);

/**
 * @swagger
 * /api/music/music-list:
 *   get:
 *     tags:
 *       - Music
 *     summary: Lấy danh sách tất cả bài hát
 *     responses:
 *       200:
 *         description: Danh sách bài hát
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Music'
 *       500:
 *         description: Server Error
 */
router.get('/music-list', MusicController.getAllMusic);

// Tìm kiếm bài hát

router.get('/music-list', MusicController.getAllMusic);

//Tìm kiếm theo ID bài hát
/**
 * @swagger
 * /api/music/music-by-id/{id}:
 *   get:
 *     tags:
 *       - Music
 *     summary: Lấy thông tin bài hát theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài hát (Mongo ObjectId)
 *     responses:
 *       200:
 *         description: Thông tin bài hát
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Music'
 *       404:
 *         description: Bài hát không tìm thấy
 *       500:
 *         description: Server Error
 */
router.get('/music-by-id/:id', MusicController.getMusicById);

//Lấy các giá trị được fetch ra từ /Preview và insert vào db
/**
 * @swagger
 * /api/music/add-musics-after-review:
 *   post:
 *     tags:
 *       - Music
 *     summary: Lưu danh sách bài hát sau khi review (insertMany)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/Music'
 *     responses:
 *       200:
 *         description: Đã lưu vào MongoDB
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Music'
 *       500:
 *         description: Lỗi khi lưu
 */
router.post('/add-musics-after-review', MusicController.addMusicsAfterReview);

//Thêm 1 bài hát mới vào router - số lượng bài hát thêm vào có thể nhiều hơn 1 - Khi check trên itunes sẽ thêm vào db ngay lập tức
/**
 * @swagger
 * /api/music/add-musics:
 *   post:
 *     tags:
 *       - Music
 *     summary: Tìm và thêm nhạc từ iTunes (gửi keyword trong body)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               keyword:
 *                 type: string
 *                 example: Adele
 *               numberOfsong:
 *                 type: integer
 *                 example: 10
 *     responses:
 *       200:
 *         description: Thêm nhạc thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Music'
 *       400:
 *         description: Thiếu từ khóa tìm kiếm (keyword)
 *       500:
 *         description: Server Error
 */
router.post('/add-musics', MusicController.addMusics);

//update thông tin 1 bài hát qua id của nó
/**
 * @swagger
 * /api/music/music-all-data/{id}:
 *   put:
 *     tags:
 *       - Music
 *     summary: Cập nhật thông tin bài hát theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài hát
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Trường cần cập nhật (ví dụ title, artist, mood...)
 *     responses:
 *       200:
 *         description: Cập nhật thành công
 *       404:
 *         description: Không tìm thấy bài nhạc
 *       500:
 *         description: Server Error
 */
router.put('/music-all-data/:id', MusicController.updateMusic);

//update thông tin mood của  1 bài hát qua id của nó
// router.put('music-mood/:id', MusicController.updateMusicMood);

//Xóa bài hát theo ID
/**
 * @swagger
 * /api/music/music-by-id/{id}:
 *   delete:
 *     tags:
 *       - Music
 *     summary: Xóa bài hát theo ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của bài hát
 *     responses:
 *       200:
 *         description: Xóa bài hát thành công
 *       404:
 *         description: Bài hát không tìm thấy
 *       500:
 *         description: Server Error
 */
router.delete('/music-by-id/:id', MusicController.deleteMusic);

module.exports = router;