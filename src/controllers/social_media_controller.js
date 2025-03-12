const pool = require('../../db');
const upload = require('../middleware/upload');
const fs = require('fs');
const socialMediaModel = require('../models/social_media_model');

const createSocialMedia = async (req, res) => {
    try {
        let iconPath = "";
        if (req.files && req.files.icon) {
            iconPath = req.files.icon[0].path;
        }

        const socialMediaId = await socialMediaModel.createSocialMedia({
            title: req.body.title,
            icon: iconPath,
            link: req.body.link
        });

        res.status(201).json({
            status: true,
            message: "Social media entry created successfully",
            data: { title: req.body.title, link: req.body.link, icon: iconPath }
        });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

const uploadFiles = upload.fields([
    { name: 'icon', maxCount: 1 }
]);

const getAllSocialMedia = async (req, res) => {
    try {
        const socialMedia = await socialMediaModel.getAllSocialMedia();
        res.json({ status: true, message: "Get all social media entries successful.", socialMedia });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

const getSocialMediaById = async (req, res) => {
    try {
        const socialMedia = await socialMediaModel.getSocialMediaById(req.params.id);
        if (!socialMedia) {
            return res.status(404).json({ status: false, message: "Social media entry not found" });
        }
        res.json({ status: true, message: "Get social media entry successful", socialMedia });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

const updateSocialMedia = async (req, res) => {
    try {
        const socialMediaId = req.params.id;
        const existingSocialMedia = await socialMediaModel.getSocialMediaById(socialMediaId);

        if (!existingSocialMedia) {
            return res.status(404).json({ status: false, message: "Social media entry not found" });
        }

        let iconPath = existingSocialMedia.icon;
        if (req.files && req.files.icon) {
            if (fs.existsSync(existingSocialMedia.icon)) {
                fs.unlinkSync(existingSocialMedia.icon);
            }
            iconPath = req.files.icon[0].path;
        }

        const updated = await socialMediaModel.updateSocialMedia(socialMediaId, {
            title: req.body.title || existingSocialMedia.title,
            icon: iconPath,
            link: req.body.link || existingSocialMedia.link
        });

        if (!updated) {
            return res.status(400).json({ status: false, message: "Update failed" });
        }

        res.json({ status: true, message: "Social media entry updated successfully" });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

const deleteSocialMedia = async (req, res) => {
    try {
        const deleted = await socialMediaModel.deleteSocialMedia(req.params.id);
        if (!deleted) {
            return res.status(404).json({ status: false, message: "Social media entry not found" });
        }
        res.json({ status: true, message: "Social media entry deleted successfully" });
    } catch (error) {
        res.status(500).json({ status: false, message: error.message });
    }
};

module.exports = {
    createSocialMedia,
    uploadFiles,
    getAllSocialMedia,
    getSocialMediaById,
    updateSocialMedia,
    deleteSocialMedia
};
