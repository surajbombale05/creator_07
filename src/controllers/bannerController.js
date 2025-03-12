const { timeLog } = require('console');
const Banner = require('../models/bannerModel');
const moment = require('moment-timezone');
const {formatTimeToIST} = require('../../utils/dateUtils')
const { validationResult } = require('express-validator');
const path = require('path');

exports.createBanner = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Image file is required.' });
  }

  const { url, title, description } = req.body;
  if (!url || url.trim() === '') {
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required when URL is empty or unchecked.' });
    }
  }
  
  const date = formatTimeToIST().format('DD-MM-YYYY');

  const sanitizedUrl = url && url.trim() === '' ? null : url;

  const profileImagePath = req.file.path.replace(/\\/g, '/');
  const profileImageFilename = '/' + path.basename(profileImagePath);

  try {
    const newTopic = await Banner.create({
      image_path: profileImageFilename,
      url: sanitizedUrl === '' ? null : sanitizedUrl,
      title,
      description,
      date
    });

    return res.status(200).json({ message: 'Banner Data', data: newTopic });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.getAllBanners = async (req, res) => {
    try {
        const banners = await Banner.findAllBanners()
        return res.status(200).json({ msg: 'List Of All Banners', data: banners });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getBannerById = async (req, res) => {
  const bannerId = req.params.id;

  try {
      const banner = await Banner.findBannerById(bannerId);
      if (!banner) {
          return res.status(404).json({ error: 'Banner not found' });
      }
      return res.json(banner);
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
};
exports.updateBanner = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({ errors: errorMessages });
  }

  const bannerId = req.params.id;
  const { url, title, description } = req.body;
  let image_path;

  try {
      if (req.file) {
          let workImagePath = req.file.path.replace(/\\/g, "/");
          image_path = "/" + path.basename(workImagePath);
      }

      // Check if URL is empty and if title or description are provided
      if (!url && (!title || !description)) {
          return res.status(400).json({ error: 'If URL is empty, title and description are required' });
      }

      // Determine whether URL or title and description are being updated
      if (url !== undefined && url !== null && url !== '') {
          // If URL is provided for update, set title and description to null if provided
          const updatedBanner = await Banner.updateBanner(bannerId, {
              image_path,
              url,
              title: title !== undefined ? null : title,
              description: description !== undefined ? null : description,
          });

      } else {
          // If title and description are provided for update, set URL to null
          const updatedBanner = await Banner.updateBanner(bannerId, {
              image_path,
              url: null,
              title,
              description,
          });

      }

      const findUpdatedBanner = await Banner.findBannerById(bannerId);
      return res.status(200).json({ message: 'Banner updated successfully', data: findUpdatedBanner });
  } catch (error) {
      console.error('Error in updateBanner:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
};



exports.deleteBanner = async (req, res) => {
    const bannerId = req.params.id;

    try {
        const success = await Banner.deleteBanner(bannerId);

        if (!success) {
            return res.status(404).json({ error: 'Banner not found' });
        }

        return res.json({ message: 'Banner deleted successfully' });
    } catch (error) {
        console.error('Error in deleteBanner:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};
