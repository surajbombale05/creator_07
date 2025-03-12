const TrendingTopic = require('../models/trendingTopicModel');
const Banner = require('../models/bannerModel');
const Topic = require('../models/topicsModel');
const YouTubeUpdate = require('../models/youtubeUpdatesModel');
const ClicksUpdater = require('../models/commonClickUpdateModel');
const { validationResult } = require('express-validator');
const path = require('path');
const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const {formatTimeToIST} = require('../../utils/dateUtils')
const SavedTopic = require('../models/savedTopicModel');
const setReminder = require('../models/setReminderModel');
const savedCategory = require('../models/savedCategoryModel');
const category = require('../models/categoriesModel');
const subCategory = require('../models/subCategoryModel');


exports.getAllViewedByTopics = async (req, res) => {
  const {topicId} = req.body
    try {
        const topics = await TrendingTopic.findTrendingTopicById(topicId);
        if(!topics) {
          return res.status(404).json({ errors: ['Trending Topic not found'] });
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
exports.createTrendingTopic = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  if (!req.file) {
    return res.status(400).json({ errors: ['Image file is required.'] });
  }

  const { title, description, teamId, categoryId, subCategoryId } = req.body;
  
  
  const date = formatTimeToIST().format('YYYY-MM-DD HH:mm:ss');
  const profileImagePath = req.file.path.replace(/\\/g, '/');
  const profileImageFilename = '/' + path.basename(profileImagePath);

  try {
    const findAllTeamMember = await Admin.findAdminById(teamId);
    if(!findAllTeamMember){
      return res.status(404).json({ errors: ['Team Member not found'] });
    }
    const findcategory = await category.findCategoryById(categoryId);
    if(!findcategory){
      return res.status(404).json({ errors: ['Category not found'] });
    }
    if(subCategoryId){
    const findSubCategory = await subCategory.findsubCategoryById(categoryId);
    if (findSubCategory.length === 0) {
      return res.status(404).json({ errors: ['SubCategory not found'] });
    }
    const findCorrcetSubCategory = findSubCategory.find(
      (sub) => sub.id.toString() === subCategoryId
    );
    if (!findCorrcetSubCategory) {
      return res.status(404).json({ errors: ['SubCategory not present'] });
    }
    }
    const newTopic = await TrendingTopic.create({
      image_path: profileImageFilename,
      title,
      url: null,
      description,
      teamId,
      categoryId,
      subCategoryId: subCategoryId === '' ? null : subCategoryId,
      date,
      type: findAllTeamMember.type,
      bannerId: null,
    });

    return res.status(200).json({ message: 'Trending Topics Data', data: newTopic });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
};

exports.getAllTrendingTopics = async (req, res) => {
    try {
        const trendingTopic = await TrendingTopic.findAllTrendingTopics()
        return res.status(200).json({ message: 'List Of All Trending Topics', data: trendingTopic });
    } catch (error) {
        console.error(error);
        return res.status(407).json({ errors: ['Something went wrong'] });
    }
};

exports.getTrendingTopicsById = async (req, res) => {
  const trendingTopicId = req.params.id;

  try {
      const trendingTopic = await TrendingTopic.findTrendingTopicById(trendingTopicId);
      if (!trendingTopic) {
          return res.status(404).json({ error: 'Trending Topic not found' });
      }
      return res.json(trendingTopic);
  } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateTrendingTopic = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({ errors: errorMessages });
    }

    const trendingTopicId = req.params.id;
    const {title, description, categoryId, subCategoryId } = req.body;
    let image_path;

    try {
        if (req.file) {
            let workImagePath = req.file.path.replace(/\\/g, "/");
            image_path = "/" + path.basename(workImagePath);
        }

        const updateTrendingTopic = await TrendingTopic.updateTrendingTopic(trendingTopicId, {
            title, 
            description, 
            image_path,
            categoryId,
            subCategoryId
        });
        const findUpdatedTrendingTopic = await TrendingTopic.findTrendingTopicById(trendingTopicId);
        return res.status(200).json({ message: 'Trending topic updated successfully', data: findUpdatedTrendingTopic });
    } catch (error) {
        console.error('Error in updateTrendingTopic:', error);
        return res.status(407).json({ errors: ['Something went wrong'] });
    }
};


exports.deleteTrendingTopic = async (req, res) => {
    const trendingfTopicId = req.params.id;

    try {
        const success = await TrendingTopic.deleteTrendingTopic(trendingfTopicId);

        if (!success) {
            return res.status(404).json({ error: 'Trending Topic not found' });
        }

        return res.json({ message: 'Trending Topic deleted successfully' });
    } catch (error) {
        console.error('Error in deleteTrending Topic:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
};

exports.getAllHomeData = async (req, res) => {
    const {userId} = req.body;
    try {
        const findSavedCategory = await savedCategory.findSavedCategoryByUserId(userId);
        const categoryId = findSavedCategory ? findSavedCategory.categoryId : null;
        const subCategoryId = findSavedCategory ? findSavedCategory.subcategory : null;
        const trendingTopic = await TrendingTopic.findAllTrendingTopicsWithLimit();
        const youtubeUpdate = await YouTubeUpdate.findAllYoutubeUpdates();
        const topic = await Topic.findAllTopicWithLimit(categoryId, subCategoryId);
        const savedTopics = await SavedTopic.findSavedTopicByUserId(userId);
        const topicIds = savedTopics.map(savedTopic => JSON.parse(savedTopic.topic_ids)).flat();
        const topicsWithSavedFlag = topic.map(topic => {
            topic.is_saved = topicIds.includes(topic.id) ? 1 : 0;
            return topic;
        });
        const totalTrendingTopics = trendingTopic.length;
        const trendingTopicsPerSection = Math.ceil(totalTrendingTopics / 2);
        const trendingTopicsForBanners = trendingTopic.slice(0, trendingTopicsPerSection);
        const trendingTopicsForTrendingTopicSection = trendingTopic.slice(trendingTopicsPerSection);

        const data = {
            topic:topicsWithSavedFlag,
            trendingTopic: {
                banners: trendingTopicsForBanners,
                trendingTopic:trendingTopicsForTrendingTopicSection
            },
            youtubeUpdate:youtubeUpdate
        }
        return res.status(200).json({message:"Home page data",data});
    } catch (error) {
        console.error(error);
        return res.status(407).json({ errors: ['Something went wrong'] });
    }
};


exports.countClicks = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({ errors: errorMessages });
    }
    const {userId,commonId,type} = req.body;
    try {
        const findUser = await User.findUserById(userId);
        if (!findUser) {
            return res.status(404).json({ errors: ['User does not exist'] });
        }
        const idExists = await ClicksUpdater.findUserById(type, 'id', commonId);
        if (!idExists) {
            return res.status(404).json({ errors: ['Common ID does not exist'] });
        }
        await ClicksUpdater.updateViewedBy(type,commonId,userId);
        const updateCount = await ClicksUpdater.updateClicksAndViews(type,commonId);
        return res.status(200).json({ message: 'Views And Clicks Updated Successfully', data: updateCount });
    } catch (error) {
        console.error(error);
        return res.status(407).json({ errors: ['Something went wrong'] });
    }
}

exports.getAllTrendingTopicAndBanner = async (req, res) => {
    try {
        const allBanner = await Banner.findAllBanners();
        const trendingTopic = await TrendingTopic.findAllTrendingTopics();
        const data = {
            banner: allBanner,
            trendingTopic: trendingTopic
        }
        return res.status(200).json({ msg: 'List Of All Trending Topics', data: data });
    }catch(error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}


exports.updateTrendingTopicStatus = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({ errors: errorMessages });
    }
    const { trendingTopicId, status, teamId } = req.body;
    try {
        const findTrendingTopic = await TrendingTopic.findTrendingTopicById(trendingTopicId);
        if (!findTrendingTopic) {
            return res.status(404).json({ errors: ['Trending Topic not found'] });
        }
        const teamMember = await Admin.findAdminById(teamId);
        if (!teamMember) {
            return res.status(404).json({ errors: ['Team Member not found'] });
        }
        if(teamMember.type !== 'admin') {
            return res.status(403).json({ errors: ['You are not authorized to perform this action'] });
        }
        const updateStatus = await TrendingTopic.updateTrendingTopicStatus(trendingTopicId, status, formatTimeToIST().format('YYYY-MM-DD'), formatTimeToIST().format('HH:mm:ss'));
        return res.status(200).json({ message: `Trending Topic ${status === '1' ? 'accepted' : 'rejected'} Successfully` });
    } catch (error) {
        console.error(error);
        return res.status(407).json({ errors: ['Something went wrong'] });
    }
}




exports.getAllViewedByTrendingTopics = async (req, res) => {
    const {topicId} = req.body
      try {
          const topics = await TrendingTopic.findTrendingTopicById(topicId);
          if(!topics) {
            return res.status(404).json({ errors: ['Trending Topic not found'] });
          }
          if(topics.viewedBy === null){
            return res.status(404).json({ errors: ['No People Viewed this Trending Topic'] });
          }
          const viewedByArray = JSON.parse(topics.viewedBy);
          const removeDublicate = new Set(viewedByArray);
          const viewedBy = [...removeDublicate]; 
          const findUserDetails = viewedBy.map(async (userId) => {
            const user = await User.findUserById(userId);
            return {userId, name: `${user.firstName} ${user.lastName}`, image_path: user.profile_image};
          })    
          return res.json({ message: 'List Of All Trending Topics Viewers', data: await Promise.all(findUserDetails) });
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
      const findTopic = await TrendingTopic.findTrendingTopicById(topicId);
      if (!findTopic) {
        return res.status(404).json({ errors: ['Trending Topic not found'] });
      }
      const findAdmin = await Admin.findAdminById(teamId);
      if(findAdmin.type !== 'admin') {
        return res.status(404).json({ errors: ['Only Admins can update banners'] });
      }
      const profileImagePath = req.file.path.replace(/\\/g, '/');
      const profileImageFilename = '/' + path.basename(profileImagePath);
      const updateTopicById = await TrendingTopic.updateBannerData(topicId, profileImageFilename);
      return res.status(200).json({ message: 'Banner updated successfully' });
    } catch (error) {
        console.error(error);
        return res.status(407).json({ errors: ['Something went wrong'] });
    }
  };
  
  
  exports.deleteBannerData = async (req, res) => {
    const {topicId, teamId} = req.body;
    try {
      const findTopic = await TrendingTopic.findTrendingTopicById(topicId);
      if (!findTopic) {
        return res.status(404).json({ errors: ['Trending Topic not found'] });
      }
      const findAdmin = await Admin.findAdminById(teamId);
      if(findAdmin.type !== 'admin') {
        return res.status(404).json({ errors: ['Only Admins can delete banners'] });
      }
      const updateTopicById = await TrendingTopic.updateBannerData(topicId, null);
      return res.status(200).json({ message: 'Banner deleted successfully' });
    } catch (error) {
        console.error(error);
        return res.status(407).json({ errors: ['Something went wrong'] });
    }
  };


  exports.getAllTrendingTopicsAdmin = async (req, res) => {
    const {teamId} = req.body
      try {
          const findTeam = await Admin.findAdminById(teamId);
          if(!findTeam) {
            return res.status(404).json({ errors: ['Team not found'] });
          }
          let topics;
          if(findTeam.type === 'admin') {
            topics = await TrendingTopic.getAllTrendingTopicsOnlyAdmin();
          }else{
            topics = await TrendingTopic.getAllTrendingTopicsAdmin(teamId);
          }
          const processedTopics = await processTrendingTopics(topics);
          return res.json({ message: 'List Of All Trending Topics', data: processedTopics });
      } catch (error) {
          console.error(error);
          return res.status(407).json({ errors: ['Something went wrong'] });
      }
  };


  exports.updateSelectedTopicStatus = async (req, res) => {
    const {trendingTopicId, status, teamId} = req.body;
    try {
      const findTrendingTopic = await TrendingTopic.findTrendingTopicById(trendingTopicId);
      if(!findTrendingTopic) {
        return res.status(404).json({ errors: ['Trending Topic not found'] });
      }
      const findAdmin = await Admin.findAdminById(teamId);
      if(findAdmin.type !== 'admin') {
        return res.status(404).json({ errors: ['Only Admins can update selected topics'] });
      }
      const updateStatus = await TrendingTopic.updateSelectedTopicStatus(trendingTopicId, status);
      return res.status(200).json({ message: `Trending Topic selected Successfully` });
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
  
  

