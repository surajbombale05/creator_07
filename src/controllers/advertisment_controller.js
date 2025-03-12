const advertismentModel = require('../models/advertisement_model');
const upload = require('../middleware/upload');
const fs = require('fs');

const createAdvertisement = async (req, res) => {
    try {

        console.log("Incoming Files:", req.files);

        const photo_path = req.files?.photo?.[0]?.path || null;
        const video_path =req.files?.video?.[0]?.path || null;

        const advertisement = await advertismentModel.createAdvertisement({ 
            photo: photo_path, 
            video: video_path, 
            is_photo: req.body.is_photo, 
            button_text: req.body.button_text, 
            button_background_color: req.body.button_background_color, 
            url: req.body.url, 
            button_text_color: req.body.button_text_color 
        });

        if (!advertisement) {
            return res.status(400).json({ status: false, message: "Failed to create advertisement" });
        }

        res.status(201).json({ 
            status: true, 
            message: "Advertisement created successfully", 
            advertisement 
        });

    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};


const uploadFiles = upload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'video', maxCount: 1 }
]);

const getAllAdvertisements = async (req, res) => {
    try {
        const advertisements = await advertismentModel.getAllAdvertisements();
        res.status(200).json({ status: true, message: "Get all advertisements successfully", advertisements });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

const getAdvertisementById = async (req, res) => {
    try {
        const advertisement = await advertismentModel.getAdvertisementById(req.params.id);
        if (!advertisement) {
            return res.status(404).json({ status: false, message: "Advertisement not found" });
        }
        res.status(200).json({ status: true, message: "Get all advertisements successfully", advertisement });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

const updateAdvertisement = async (req, res) => {
    try {
        let advertisement = await advertismentModel.getAdvertisementById(req.params.id);
        if (!advertisement) {
            return res.status(404).json({ status: false, message: "Advertisement not found" });
        }

        let photo_path = advertisement.photoPath;
        let video_path = advertisement.videoPath;

        if (req.files?.photo) {
            if (photo_path) fs.unlinkSync(photo_path); // Delete old photo
            photo_path = req.files.photo[0].path;
        }

        if (req.files?.video) {
            if (video_path) fs.unlinkSync(video_path); // Delete old video
            video_path = req.files.video[0].path;
        }

        const updatedData = {
            photoPath: photo_path,
            videoPath: video_path,
            is_photo: req.body.is_photo,
            button_text: req.body.button_text,
            button_background_color: req.body.button_background_color,
            url: req.body.url,
            button_text_color: req.body.button_text_color
        };

        const updated = await advertismentModel.updateAdvertisement(req.params.id, updatedData);
        if (!updated) {
            return res.status(400).json({ status: false, message: "No changes made" });
        }

        res.status(200).json({ status: true, message: "Advertisement updated successfully", updatedAdvertisement: updated });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};


const deleteAdvertisement = async (req, res) => {
    try {
        const deleted = await advertismentModel.deleteAdvertisement(req.params.id);
        if (!deleted) {
            return res.status(404).json({ status: false, message: "Advertisement not found" });
        }
        res.status(200).json({ status: true, message: "Advertisement deleted successfully" });
    } catch (error) {
        res.status(500).json({ status: false, error: error.message });
    }
};

module.exports = {
    createAdvertisement,
    uploadFiles,
    getAllAdvertisements,
    getAdvertisementById,
    updateAdvertisement,
    deleteAdvertisement
};
