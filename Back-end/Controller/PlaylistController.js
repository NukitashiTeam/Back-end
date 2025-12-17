// @ts-nocheck
const express = require('express');

const Playlist = require('../Model/PlaylistSchema');

exports.createPlaylist = async (req, res) => {
    try{
        const {title} = req.body;
        const userId = req.user._id;

        const newPlaylist = new Playlist({
            title: title,
            thumbnail: "",
            type: 'random',
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
