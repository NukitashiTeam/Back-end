// @ts-nocheck
const express = require('express');
const router = express.Router();
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const { mapGenreToMoods } = require('../Middleware/MoodMapping');
const Music = require('../Model/MusicSchema'); 
const Mood = require('../Model/MoodSchema');
const { analyzeMoodWithAI } = require('../Middleware/AIMoodMapping');


// @ts-ignore
exports.checkMusicInItunes = async (req, res) => {
  try{
    const { keyword, numberOfsong } = req.query;
    if (!keyword) return res.status(400).json({ message: 'Thiếu keyword' });

    const allMoods = await Mood.find().sort({ createdAt: -1 }).select('name');

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(keyword)}&entity=musicTrack&limit=${encodeURIComponent(numberOfsong)}`;
    const response = await axios.get(url);
    const results = response.data.results;

    const musicsWithMood = await Promise.all(
      // @ts-ignore
      results.map(async (track) => {
    
        const genre = track.primaryGenreName || 'Pop';
        const duration = await Math.floor(track.trackTimeMillis / 1000);
        const moods = await mapGenreToMoods(genre);

        let finalMoods = [];
        let aiUsed = false;

        const aiResult = await analyzeMoodWithAI(track.trackName, track.artistName);
        console.log('AI Mood Analysis Result:', aiResult);

        if (aiResult && aiResult.moods) {
            finalMoods = aiResult.moods.map((moodNameFromAI, idx) => {
                const matchedObject = allMoods.find(
                    m => m.name.toLowerCase() === moodNameFromAI.toLowerCase()
                );
                if (matchedObject) {
                    return {
                        mood: matchedObject._id, // Lấy ID chuẩn
                        name: matchedObject.name,
                        confidence: idx === 0 ? 0.9 : 0.7
                    };
                }
                return null;
            }).filter(item => item !== null);

            if (finalMoods.length > 0) aiUsed = true;
        }

        // Fallback nếu AI tạch
        if (!aiUsed) {
            finalMoods = await mapGenreToMoods(genre);
        }

        return {
          track_id: track.trackId.toString(),
          title: track.trackName,
          artist: track.artistName,
          album: track.collectionName,
          genre: genre,
          duration: duration,
          mp3_url: track.previewUrl,
          image_url: track.artworkUrl100,
          release_date: track.releaseDate,
          moods: finalMoods,           // ← Thêm moods vào đây
        };
      })
    );

    let newSongCount = 0;
    let songArrayReturn = [];
    await Promise.all(musicsWithMood.map(async (song) => {
    
    const exists = await Music.findOne({ track_id: song.track_id });


    if (!exists) {
        const newSong = await Music.create(song);
        console.log(`🎵 Lưu bài mới: ${newSong}`);
        songArrayReturn.push(newSong.toObject());
        newSongCount++;
    }

    else songArrayReturn.push(exists);
  }));

    // Chỉ trả về preview, chưa lưu
    res.status(200).json({ message: 'Dữ liệu tìm kiếm', preview: songArrayReturn, total_found: musicsWithMood.length,
        newly_saved: newSongCount,});


  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error' });
  }
}

// @ts-ignore
exports.checkMusicBaseOnArtist = async (req, res) => {
  try{
    const {artistName, limit} = req.query;
    if(!artistName) return res.status(400).json({message: "the artist's name is not found"})

    const songLimit = limit || 1;

    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(artistName)}&entity=musicTrack&attribute=artistTerm&limit=${songLimit}`;

    console.log(`🎤 Searching Artist: ${artistName}`);
    const response = await axios.get(url);

    const results = response.data.results;

    const musicsWithMood = await Promise.all(
      // @ts-ignore
      results.map(async (track) => {
    
        const genre = track.primaryGenreName || 'Pop';
    
        const moods = await mapGenreToMoods(genre);
        
        return {
          track_id: track.trackId.toString(),
          title: track.trackName,
          artist: track.artistName,
          album: track.collectionName,
          genre: genre,
          mp3_url: track.previewUrl,
          image_url: track.artworkUrl100,
          is_premium: track.trackPrice > 0,
          release_date: track.releaseDate,
          moods: moods,           
        };
      })
    );

    res.status(200).json({
        message: 'Kết quả tìm kiếm bài hát',
        count: musicsWithMood.length,
        data: musicsWithMood
    });

  }
  catch(err){
    console.error('Search Song Error:', err);
    res.status(500).json({ message: 'Lỗi server khi tìm bài hát' });
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
    const { keyword, numberOfsong } = req.query;
    if (!keyword) return res.status(400).json({ message: 'Thiếu từ khóa tìm kiếm (keyword)' });

    // Gọi iTunes API
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(keyword)}&entity=musicTrack&limit=${encodeURIComponent(numberOfsong)}`;
    const response = await axios.get(url);
    const results = response.data.results;

    // @ts-ignore
    const musicsWithMood = await Promise.all(
      // @ts-ignore
      results.map(async (track) => {
    
        const genre = track.primaryGenreName || 'Pop';
    
        const moods = await mapGenreToMoods(genre);
        
        return {
          track_id: track.trackId.toString(),
          title: track.trackName,
          artist: track.artistName,
          album: track.collectionName,
          genre: genre,
          duration: Math.floor(track.trackTimeMillis / 1000),
          mp3_url: track.previewUrl,
          image_url: track.artworkUrl100,
          release_date: track.releaseDate,
          moods: moods,          
        };
      })
    );


    // Lưu vào MongoDB
    const inserted = await Music.insertMany(musicsWithMood);

  
    res.status(200).json({
      message: 'Thêm nhạc thành công',
      data: inserted,
    });

    
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server Error', error: err});
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
