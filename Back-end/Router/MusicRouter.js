// Routes/MusicRoute.js
const express = require('express');
const router = express.Router();

const MusicController = require('../Controller/MusicController');

// Gán controller vào router

//Kiểm tra bài hát trên itunes
router.get('/preview', MusicController.checkMusicInItunes);

//Tìm kiếm bài hát
router.get('/music-list', MusicController.getAllMusic);

//Tìm kiếm theo ID bài hát
router.get('/music-by-id/:id', MusicController.getMusicById);

//Lấy các giá trị được fetch ra từ /Preview và insert vào db
router.post('add-musics-after-review', MusicController.addMusicsAfterReview);

//Thêm 1 bài hát mới vào router - số lượng bài hát thêm vào có thể nhiều hơn 1 - Khi check trên itunes sẽ thêm vào db ngay lập tức
router.post('/add-musics', MusicController.addMusics);

//update thông tin 1 bài hát qua id của nó
router.put('music-all-data/:id', MusicController.updateMusic);

//update thông tin mood của  1 bài hát qua id của nó
// router.put('music-mood/:id', MusicController.updateMusicMood);

//Xóa bài hát theo ID
router.delete('/music-by-id/:id', MusicController.deleteMusic);

module.exports = router;