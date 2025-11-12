const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const Music = require('../Model/MusicSchema'); // import MusicSchema

// @ts-ignore
exports.checkMusicInItunes = async (req, res) => {
  try{
    const { keyword, numberOfsong } = req.query;
    if (!keyword) return res.status(400).json({ message: 'Thiếu keyword' });

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(keyword)}&entity=musicTrack&limit=${encodeURIComponent(numberOfsong)}`;
    const response = await axios.get(url);
    const results = response.data.results;

    // @ts-ignore
    const musics = results.map(track => ({
      track_id: track.trackId.toString(),
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName,
      genre: track.primaryGenreName,
      mp3_url: track.previewUrl,
      image_url: track.artworkUrl100,
      is_premium: track.trackPrice > 0, // ví dụ: >0 là premium
      release_date: track.releaseDate,
      mood: '',
    }));

    // Chỉ trả về preview, chưa lưu
    res.status(200).json({ message: 'Dữ liệu preview', preview: musics });


  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}


// @ts-ignore
exports.addMusicsAfterReview = async (req, res) => {
  try {
    const musics = req.body;
    const inserted = await Music.insertMany(musics);

    res.status(200).json({ message: 'Đã lưu vào MongoDB', data: inserted });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi khi lưu'});
  }
};


// @ts-ignore
exports.addMusics = async (req, res) => {
  try {
    const { keyword, numberOfsong } = req.body;
    if (!keyword) return res.status(400).json({ message: 'Thiếu từ khóa tìm kiếm (keyword)' });

    // Gọi iTunes API
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(keyword)}&entity=musicTrack&limit=${encodeURIComponent(numberOfsong)}`;
    const response = await axios.get(url);
    const results = response.data.results;

    // @ts-ignore
    const musics = results.map(track => ({
      track_id: track.trackId.toString(),
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName,
      genre: track.primaryGenreName,
      mp3_url: track.previewUrl,
      image_url: track.artworkUrl100,
      is_premium: track.trackPrice > 0, // ví dụ: >0 là premium
      release_date: track.releaseDate,
      mood: '',
    }));

    // Lưu vào MongoDB
    const inserted = await Music.insertMany(musics);

  
    res.status(200).json({
      message: 'Thêm nhạc thành công',
      data: inserted,
    });

    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


// @ts-ignore
exports.getAllMusic = async (req, res) => {
  try {
    const musics = await Music.find();
    res.json(musics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


// @ts-ignore
exports.getMusicById = async (req, res) => {
  try {
    const music = await Music.findById(req.params.id);
    if (!music) {
        return res.status(404).json({ message: 'Bài hát không tìm thấy' });
    }
    res.json(music);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};


// @ts-ignore
exports.updateMusic = async (req, res) => {
  try{
    const updateData = req.body; 
    const music = await Music.findByIdAndUpdate(req.param.id, updateData, { new: true } );

    if (!updateData) {
      return res.status(404).json({ message: 'Không tìm thấy bài nhạc này' });
    }
    res.status(200).json(updateData);

  } catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}


// // @ts-ignore
// exports.updateMusicMood = async (req, res) => {
//   try{

//   }
//   catch (err) {

//   }
// }


// @ts-ignore
exports.deleteMusic = async (req, res) => {
  try {
    const music = await Music.findByIdAndDelete(req.params.id);
    if (!music) {
        return res.status(404).json({ message: 'Bài hát không tìm thấy' });
    }
    res.json({ message: 'Xóa bài hát thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
};
