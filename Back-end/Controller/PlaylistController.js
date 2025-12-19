// @ts-nocheck
const express = require('express');

const Playlist = require('../Model/PlaylistSchema');
const Music = require('../Model/MusicSchema');

exports.createPlaylist = async (req, res) => {
    try{
        const {title} = req.body;
        const userId = req.user._id;

        const newPlaylist = new Playlist({
            title: title,
            thumbnail: "",
            type: 'manual',
            songs: [],
            owner: userId,
            isPublic: true
        });

        await newPlaylist.save();
        return res.status(201).json({
                success: true,
                message: "Tạo playlist thành công!",
                data: newPlaylist
            });
    } catch (err) {
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
}


exports.getAllPlaylistByUser = async (req, res) => {
    try{
        const userId = req.user._id;
        const playlists = await Playlist.find({ owner: userId });

        return res.status(200).json({
            success: true,
            data: playlists
        });
    }
    catch(err){
        return res.status(500).json({
            success: false,
            error: err.message
        });
    }
}


exports.addSongIntoPlaylist = async (req, res) => {
    try{
        const {musicId} = req.body;
        const {playlistId} = req.params;
        const userId = req.user._id;

        const songData = await Music.findById(musicId);
        if (!songData) return res.status(404).json({ message: "Không tìm thấy bài hát" });

        const playlist = await Playlist.findById(playlistId);
        if(!playlist) return res.status(404).json({ message: "playlist không tồn tại trong hệ thống của người dùng"});

        const updatedPlaylist = await Playlist.findOneAndUpdate(
            { _id: playlistId, owner: userId, "songs.songId": { $ne: musicId } },
            { 
                $push: { 
                    songs: { 
                        songId: songData._id, 
                        title: songData.title, 
                        artist: songData.artist 
                    } 
                } 
            },
            { new: true }
        );

        

        res.status(200).json({ success: true, data: updatedPlaylist, musicData: songData, playlist: playlist});
    }
    catch(err){
        res.status(500).json({ error: err.message });
    }
}


exports.createArraySongsRandomByMood = async (req, res) => {
    try {
        const moodName = req.query.moodName;
        const userId = req.user._id;

        // 1. Lấy ngẫu nhiên 5 bài hát từ Music dựa trên moodName
        const randomSongs = await Music.aggregate([
            { $match: { "moods.name": moodName } },
            { $sample: { size: 5 } }, 
            { $project: { _id: 1, title: 1, artist: 1 } }
        ]);

        if (randomSongs.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy bài hát nào cho mood này" });
        }

        // 2. Map dữ liệu để khớp với PlaylistSchema
        const formattedSongs = randomSongs.map(song => ({
            songId: song._id,
            title: song.title,
            artist: song.artist
        }));

        // 3. Tạo Playlist mới
        const newPlaylist = new Playlist({
            title: `Ngẫu nhiên - ${moodName}`,
            type: 'random',
            mood: moodName,
            songs: formattedSongs,
            owner: userId,
            isPublic: true
        });

    //    const savedPlaylist = await newPlaylist.save();

        res.status(201).json({ success: true, data: formattedSongs, mood: moodName});
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};


exports.createRandomPlaylist = async (req, res) => {
    try {
        const { title, songs, mood} = req.body; 
        const userId = req.user._id; //

        if (!songs || songs.length === 0) {
            return res.status(400).json({ message: "Danh sách bài hát không được để trống" });
        }

        // 2. Khởi tạo Object Playlist mới
        const newPlaylist = new Playlist({
            title: title || "Playlist gợi ý mới",
            thumbnail: "https://via.placeholder.com/150",
            type: 'random',
            mood: mood,
            songs: songs, 
            owner: userId,
            isPublic: true
        });

        const savedPlaylist = await newPlaylist.save(); 

        res.status(201).json({
            success: true,
            message: "Playlist đã được lưu vào thư viện của bạn!",
            data: savedPlaylist
        });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};
