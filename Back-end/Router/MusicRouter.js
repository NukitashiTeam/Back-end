// Routes/MusicRoute.js
const express = require('express');
const router = express.Router();

const MusicController = require('../Controller/MusicController');

// Gán controller vào router

//Thêm 1 bài hát mới vào router - số lượng bài hát thêm vào có thể nhiều hơn 1
router.post('/add-music', MusicController.addMusic);

//Tìm kiếm bài hát
router.get('/music-list', MusicController.getAllMusic);

//Tìm kiếm theo ID bài hát
router.get('/music-by-id/:id', MusicController.getMusicById);

//Xóa bài hát theo ID
router.delete('/music-by-id/:id', MusicController.deleteMusic);

module.exports = router;