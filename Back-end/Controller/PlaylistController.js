// @ts-nocheck
const express = require('express');

const Playlist = require('../Model/PlaylistSchema');
const Music = require('../Model/MusicSchema');
const Context = require('../Model/ContextSchema');

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

exports.getPlaylistDetail = async (req, res) => {
    try {
        const { id } = req.params; // Lấy ID từ URL param
        const userId = req.user._id;

        const playlist = await Playlist.findById(id)
            .populate('owner', 'name avatar'); // Populate thêm info người tạo nếu cần

        if (!playlist) {
            return res.status(404).json({ message: "Playlist không tồn tại" });
        }

        // Kiểm tra quyền: Nếu không phải public VÀ không phải của chính mình thì chặn
        if (!playlist.isPublic && playlist.owner._id.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Bạn không có quyền xem playlist này" });
        }

        return res.status(200).json(playlist);

    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

exports.createArraySongsRandomByContext = async (req, res) => {
    try {
        const { contextName } = req.query;

        if (!contextName) {
            return res.status(400).json({ message: "Thiếu tên ngữ cảnh (contextName)" });
        }

        // B1: Tìm Context để lấy danh sách Mood IDs
        // (Lưu ý: contextName cần khớp với field 'name' trong ContextSchema)
        const contextData = await Context.findOne({ name: contextName });

        if (!contextData) {
            return res.status(404).json({ message: "Ngữ cảnh không tồn tại" });
        }

        // Lấy mảng Mood IDs thuộc context đó
        const targetMoodIds = contextData.moods;

        if (!targetMoodIds || targetMoodIds.length === 0) {
            return res.status(404).json({ message: "Ngữ cảnh này chưa có mood nào" });
        }

        // B2: Random nhạc có chứa Mood thuộc danh sách trên
        // Logic: Music.mood chứa ít nhất 1 mood nằm trong targetMoodIds
        const randomSongs = await Music.aggregate([
            { 
                $match: { 
                    mood: { $in: targetMoodIds } 
                } 
            },
            { $sample: { size: 10 } }, // Lấy ngẫu nhiên 10 bài
            { $project: { _id: 1, title: 1, artist: 1 } }
        ]);

        if (randomSongs.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy bài hát phù hợp ngữ cảnh này" });
        }

        // Map data trả về format chuẩn
        const formattedSongs = randomSongs.map(song => ({
            songId: song._id,
            title: song.title,
            artist: song.artist
        }));

        res.status(200).json({
            success: true,
            context: contextName,
            data: formattedSongs
        });

    } catch (err) {
        console.error("Error random context:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.saveRandomContextPlaylist = async (req, res) => {
    try {
        const { title, songs, context } = req.body;
        const userId = req.user._id;

        if (!songs || songs.length === 0) {
            return res.status(400).json({ message: "Danh sách bài hát trống" });
        }
        if (!context) {
            return res.status(400).json({ message: "Thiếu thông tin context" });
        }

        // Tạo Playlist mới
        const newPlaylist = new Playlist({
            title: title || `Mix cho ngữ cảnh ${context}`,
            thumbnail: "https://via.placeholder.com/150", // Hoặc lấy ảnh của context nếu có
            type: 'random',      // <--- QUAN TRỌNG: Đánh dấu là random
            context: context,    // <--- QUAN TRỌNG: Lưu context
            songs: songs,
            owner: userId,
            isPublic: true
        });

        const savedPlaylist = await newPlaylist.save();

        res.status(201).json({
            message: "Playlist đã được lưu vào thư viện của bạn!",
            data: savedPlaylist
        });

    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.removeSongFromPlaylist = async (req, res) => {
    try {
        const { playlistId } = req.params;
        const { musicId } = req.body; // Lấy musicId từ body
        const userId = req.user._id;

        if (!musicId) {
            return res.status(400).json({ message: "Thiếu musicId" });
        }

        // Tìm playlist và xóa bài hát bằng toán tử $pull
        // Điều kiện: ID playlist đúng VÀ Owner phải là user đang login
        const updatedPlaylist = await Playlist.findOneAndUpdate(
            { _id: playlistId, owner: userId },
            { 
                $pull: { 
                    songs: { songId: musicId } // Xóa phần tử có songId trùng khớp
                } 
            },
            { new: true } // Trả về data mới sau khi xóa
        );

        if (!updatedPlaylist) {
            return res.status(404).json({ message: "Playlist không tồn tại hoặc bạn không có quyền sửa đổi" });
        }

        return res.status(200).json({
            message: "Bài hát đã được xóa thành công",
            data: updatedPlaylist
        });

    } catch (err) {
        console.error("Remove song error:", err);
        return res.status(500).json({ error: err.message });
    }
};

exports.deletePlaylist = async (req, res) => {
    try {
        const { playlistId } = req.params;
        const userId = req.user._id;

        // Tìm và xóa
        // Điều kiện: ID playlist đúng VÀ Owner phải là user đang login
        const deletedPlaylist = await Playlist.findOneAndDelete({ 
            _id: playlistId, 
            owner: userId 
        });

        if (!deletedPlaylist) {
            return res.status(404).json({ message: "Playlist không tồn tại hoặc bạn không có quyền xóa" });
        }

        return res.status(200).json({
            message: "Playlist đã được xóa thành công"
        });

    } catch (err) {
        console.error("Delete playlist error:", err);
        return res.status(500).json({ error: err.message });
    }
};