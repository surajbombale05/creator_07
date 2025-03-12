    const videoModel = require('../models/video_model');
    const upload = require('../middleware/upload');
    const fs = require('fs');

    const createVideo = async (req, res) => {
        try {
            console.log("Incoming Files:", req.files);

            const thumbnailPath = req.files?.thumbnail?.[0]?.path || null;
            const videoPath = req.files?.video?.[0]?.path || null;

            const videoId = await videoModel.createVideo({
                title: req.body.title,
                category: req.body.category,
                thumbnail: thumbnailPath,
                url: req.body.url,
                video: videoPath,
                button_text_color: req.body.button_text_color
            });

            res.status(201).json({
                status: true,
                message: "Video uploaded successfully",
                data: videoId
            });

        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    };

    const uploadFiles = upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'video', maxCount: 1 }
    ]);

    const getAllVideos = async (req, res) => {
        try {
            const videos = await videoModel.getAllVideos();
            res.json({ status: true, message: "Get all videos successful.", videos });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    };

    const getVideoById = async (req, res) => {
        try {
            const video = await videoModel.getVideoById(req.params.id);
            if (!video) {
                return res.status(404).json({ status: false, message: "Video not found" });
            }
            res.json({ status: true, message: "Get video successful", video });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    };

    const updateVideo = async (req, res) => {
        try {
            console.log("Update Request Received for videoId:", req.params.id);

            const videoId = req.params.id;
            const existingVideo = await videoModel.getVideoById(videoId);

            if (!existingVideo) {
                return res.status(404).json({ status: false, message: "Video not found" });
            }

            // 🛠 Debugging: Check if files exist in request
            console.log("Incoming Files:", req.files);

            let thumbnailPath = existingVideo.thumbnail;
            let videoPath = existingVideo.video;

            if (req.files?.thumbnail?.length > 0) {
                if (existingVideo.thumbnail && fs.existsSync(existingVideo.thumbnail)) {
                    try {
                        fs.unlinkSync(existingVideo.thumbnail);
                    } catch (err) {
                        console.error("Error deleting old thumbnail:", err);
                    }
                }
                thumbnailPath = req.files.thumbnail[0].path;
            }

            if (req.files?.video?.length > 0) {
                if (existingVideo.video && fs.existsSync(existingVideo.video)) {
                    try {
                        fs.unlinkSync(existingVideo.video);
                    } catch (err) {
                        console.error("Error deleting old video:", err);
                    }
                }
                videoPath = req.files.video[0].path;
            }

            console.log("Updated values:", {
                title: req.body.title || existingVideo.title,
                category: req.body.category || existingVideo.category,
                thumbnail: thumbnailPath,
                url: req.body.url || existingVideo.url,
                video: videoPath
            });

            const updated = await videoModel.updateVideo(videoId, {
                title: req.body.title || existingVideo.title,
                category: req.body.category || existingVideo.category,
                thumbnail: thumbnailPath,
                url: req.body.url || existingVideo.url,
                video: videoPath
            });

            if (!updated) {
                return res.status(400).json({ status: false, message: "Update failed" });
            }

            res.json({ status: true, message: "Video updated successfully" });

        } catch (error) {
            console.error("Error in updateVideo:", error);
            res.status(500).json({ status: false, message: error.message });
        }
    };

    const deleteVideo = async (req, res) => {
        try {
            const existingVideo = await videoModel.getVideoById(req.params.id);

            if (!existingVideo) {
                return res.status(404).json({ status: false, message: "Video not found" });
            }

            // 🟢 Delete Files from File System
            try {
                if (fs.existsSync(existingVideo.thumbnail)) fs.unlinkSync(existingVideo.thumbnail);
                if (fs.existsSync(existingVideo.video)) fs.unlinkSync(existingVideo.video);
            } catch (error) {
                console.error("Error deleting files:", error);
            }

            // 🟢 Delete Video from Database
            const deleted = await videoModel.deleteVideo(req.params.id);
            if (!deleted) {
                return res.status(400).json({ status: false, message: "Failed to delete video" });
            }

            res.json({ status: true, message: "Video deleted successfully" });

        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    };

    module.exports = {
        createVideo,
        uploadFiles,
        getAllVideos,
        getVideoById,
        updateVideo,
        deleteVideo
    };
