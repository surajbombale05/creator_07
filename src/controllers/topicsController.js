const Topic = require('../models/topicsModel');
const { validationResult } = require('express-validator');
const path = require('path');
const {formatTimeToIST} = require('../../utils/dateUtils')
const category = require('../models/categoriesModel');
const subCategory = require('../models/subCategoryModel');
const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const banner = require('../models/bannerModel');
const savedCategory = require('../models/savedCategoryModel');

exports.createTopics = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  if (!req.file) {
    return res.status(400).json({ errors: ['Image file is required.'] });
  }
  const { url, topic, description, categoryId, subCategoryId, teamId, bannerId } = req.body;
  console.log(url, topic, description, categoryId, subCategoryId, teamId, bannerId);
  if (!url || url.trim() === '') {
    if (!description) {
      return res.status(400).json({ errors: ['Description is required when URL is empty or unchecked.'] });
    }
  } else {
    const validUrlPattern = /^(http:\/\/|https:\/\/)/;
    if (!validUrlPattern.test(url)) {
      return res.status(400).json({ errors: ["Invalid URL format. Must start with 'http://' or 'https://'"] });
    }
  }

  const date = formatTimeToIST().format('YYYY-MM-DD HH:mm:ss');
  const sanitizedUrl = url && url.trim() === '' ? null : url;
  const profileImagePath = req.file.path.replace(/\\/g, '/');
  const profileImageFilename = '/' + path.basename(profileImagePath);

  try {
    const categoryData = await category.findCategoryById(categoryId);
    if (!categoryData) {
      return res.status(404).json({ errors: ['Category not found'] });
    }
    if(subCategoryId) {
    const subCategoryData = await subCategory.findsubCategoryById(categoryId);
    if (subCategoryData.length === 0) {
      return res.status(404).json({ errors: ['SubCategory not found'] });
    }
    const subCategoryIds = subCategoryData.filter((sub) => sub.id.toString() === subCategoryId);
    if (subCategoryIds.length === 0) {
      return res.status(404).json({ errors: ['SubCategory not present'] });
    }
    }
    const teamData = await Admin.findAdminById(teamId);
    if (!teamData) {
      return res.status(404).json({ errors: ['Team not found'] });
    }
    if(bannerId) {
    const bannerData = await banner.findBannerById(bannerId);
    if (!bannerData) {
      return res.status(404).json({ errors: ['Banner not found'] });
    }
  }
    const newTopic = await Topic.create({
      image_path:profileImageFilename,
      url: sanitizedUrl === '' ? null : sanitizedUrl,
      topic,
      description,
      date,
      categoryId: categoryId,
      subCategoryId: subCategoryId === '' ? null : subCategoryId,
      teamId: teamId,
      bannerId: bannerId === '' ? null : bannerId,
      type: teamData.type
    });

    return res.status(200).json({ message: 'Topics Data', data: newTopic });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
};

exports.getAllTopics = async (req, res) => {
    try {
        const {userId} = req.body;
        const findUser = await User.findUserById(userId);
        if(!findUser) {
            return res.status(404).json({ errors: ["User not found"] });
        }
        const findSavedCategory = await savedCategory.findSavedCategoryByUserId(userId);
        const category = findSavedCategory ? findSavedCategory.categoryId : null;
        const subcategory = findSavedCategory ? findSavedCategory.subcategory : null;
        const topics = await Topic.findAllTopic(category, subcategory);
        return res.status(200).json({ message: 'List Of All Topics', data: topics });
    } catch (error) {
        console.error(error);
        return res.status(407).json({ errors: ['Something went wrong'] });
    }
};

exports.getTopicById = async (req, res) => {
    const topicId = req.params.id;

    try {
        const topic = await Topic.findTopicsById(topicId);
        if (!topic) {
            return res.status(404).json({ errors: ['Topic not found'] });
        }
        return res.json(topic);
    } catch (error) {
        console.error(error);
        return res.status(407).json({ errors: ['Something went wrong'] });
    }
};

exports.updateTopic = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({ errors: errorMessages });
  }

  const topicId = req.params.id;
  const { topic, description, categoryId, subCategoryId } = req.body;
  let image_path;

  try {
      if (req.file) {
          let workImagePath = req.file.path.replace(/\\/g, "/");
          image_path = "/" + path.basename(workImagePath);
      }

      const updateTopic = await Topic.updateTopic(topicId, {
          image_path,
          topic,
          description,
          categoryId,
          subCategoryId
      });
      const findUpdatedTopic = await Topic.findTopicsById(topicId);
      return res.status(200).json({ message: 'Topic updated successfully', data: findUpdatedTopic });
  } catch (error) {
      console.error('Error in update Topic:', error);
      return res.status(407).json({ errors: ['Something went wrong'] });
  }
};


exports.deleteTopic = async (req, res) => {
    const topicId = req.params.id;

    try {
        const success = await Topic.deleteTopic(topicId);

        if (!success) {
            return res.status(404).json({ errors: ['Topic not found'] });
        }

        return res.json({ message: 'Topic deleted successfully' });
    } catch (error) {
        console.error('Error in deleteTopic:', error);
        return res.status(404).json({ errors: ['Something went wrong'] });
    }
};


exports.updateTopicStatus = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({ errors: errorMessages });
  }
  const {topicId, teamId, status} = req.body;
  try {
    const findTopic = await Topic.findTopicsById(topicId);
    if (!findTopic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    const findAdmin = await Admin.findAdminById(teamId);
    if(findAdmin.type !== 'admin') {
      return res.status(404).json({ errors: ['Only Admins can update topics'] });
    }
     const updateTopicById = await Topic.updateTopicStatus(topicId, status, formatTimeToIST().format('YYYY-MM-DD'), formatTimeToIST().format('HH:mm:ss'));
     
     return res.status(200).json({ message:`Topic ${status === '1' ? 'accepted' : 'rejected'} successfully`});
  } catch (error) {
      console.error(error);
      return res.status(407).json({ errors: ['Something went wrong'] });
  }
}



exports.getAllTopicsAdmin = async (req, res) => {
  const {teamId} = req.body
    try {
        const findTeam = await Admin.findAdminById(teamId);
        if(!findTeam) {
          return res.status(404).json({ errors: ['Team not found'] });
        }
        let topics;
        if(findTeam.type === 'admin') {
          topics = await Topic.getAllTopicsOnlyAdmin();
        }else{
          topics = await Topic.getAllTopicsAdmin(teamId);
        }
        const findAllImage = await processTrendingTopics(topics);
        return res.json({ message: 'List Of All Topics', data: findAllImage });
    } catch (error) {
        console.error(error);
        return res.status(407).json({ errors: ['Something went wrong'] });
    }
};



exports.getAllViewedByTopics = async (req, res) => {
  const {topicId} = req.body
    try {
        const topics = await Topic.findTopicsById(topicId);
        if(!topics) {
          return res.status(404).json({ errors: ['Topic not found'] });
        }
        if(topics.viewedBy === null){
          return res.status(404).json({ errors: ['No People Viewed this Topic'] });
        }
        const viewedByArray = JSON.parse(topics.viewedBy);
        const removeDublicate = new Set(viewedByArray);
        const viewedBy = [...removeDublicate]; 
        const findUserDetails = viewedBy.map(async (userId) => {
          const user = await User.findUserById(userId);
          return {userId, name: `${user.firstName} ${user.lastName}`, image_path: user.profile_image};
        })    
        return res.json({ message: 'List Of All Topics Viewers', data: await Promise.all(findUserDetails) });
    } catch (error) {
        console.error(error);
        return res.status(407).json({ errors: ['Something went wrong'] });
    }
};

exports.updateBannerData = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({ errors: errorMessages });
  }
  const {topicId, teamId} = req.body;
  try {
    if(!req.file) {
      return res.status(400).json({ errors: ['Image file is required'] });
    }
    const findTopic = await Topic.findTopicsById(topicId);
    if (!findTopic) {
      return res.status(404).json({ errors: ['Topic not found'] });
    }
    const findAdmin = await Admin.findAdminById(teamId);
    if(findAdmin.type !== 'admin') {
      return res.status(404).json({ errors: ['Only Admins can update banners'] });
    }
    const profileImagePath = req.file.path.replace(/\\/g, '/');
    const profileImageFilename = '/' + path.basename(profileImagePath);
    const updateTopicById = await Topic.updateBannerData(topicId, profileImageFilename);
    return res.status(200).json({ message: 'Banner updated successfully' });
  } catch (error) {
      console.error(error);
      return res.status(407).json({ errors: ['Something went wrong'] });
  }
};


exports.deleteBannerData = async (req, res) => {
  const {topicId, teamId} = req.body;
  try {
    const findTopic = await Topic.findTopicsById(topicId);
    if (!findTopic) {
      return res.status(404).json({ errors: ['Topic not found'] });
    }
    const findAdmin = await Admin.findAdminById(teamId);
    if(findAdmin.type !== 'admin') {
      return res.status(404).json({ errors: ['Only Admins can delete banners'] });
    }
    const updateTopicById = await Topic.updateBannerData(topicId, null);
    return res.status(200).json({ message: 'Banner deleted successfully' });
  } catch (error) {
      console.error(error);
      return res.status(407).json({ errors: ['Something went wrong'] });
  }
};


exports.updateSelectedTopicsStatus = async (req, res) => {
  const {topicId, status, teamId} = req.body;
  try {
    const findTrendingTopic = await Topic.findTopicsById(topicId)
    if(!findTrendingTopic) {
      return res.status(404).json({ errors: ['Topic not found'] });
    }
    const findAdmin = await Admin.findAdminById(teamId);
    if(findAdmin.type !== 'admin') {
      return res.status(404).json({ errors: ['Only Admins can update selected topics'] });
    }
    const updateStatus = await Topic.updateSelectedTopicStatus(topicId, status);
    return res.status(200).json({ message: `Topic selected Successfully` });
  } catch (error) {
      console.error(error);
      return res.status(407).json({ errors: ['Something went wrong'] });
  }
};



async function processTrendingTopics(topics) {
  return Promise.all(topics.map(async (topic) => {
    try {
      const viewedByArray = topic.viewedBy ? JSON.parse(topic.viewedBy) : []; 
      if (!Array.isArray(viewedByArray)) {
        console.warn(`Invalid viewedBy format for topic ID ${topic.id}:`, topic.viewedBy);
        return { ...topic, lastSixProfileImages: [] };
      }  
      const lastSixViewedBy = [...viewedByArray].slice(-6).reverse();
      const profileImagesPromises = lastSixViewedBy.map(id => User.findUserById(id));
      const profileImages = await Promise.all(profileImagesPromises).then(profiles => profiles.map(profile => profile.profile_image));
      topic.clicks = profileImages;
      return topic;
    } catch (error) {
      console.error(`Error processing topic ID ${topic.id}:`, error);
      return { ...topic, lastSixProfileImages: [] }; 
    }
  }));
}