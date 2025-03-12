const YoutubeUpdates = require("../models/youtubeUpdatesModel");
const { validationResult } = require("express-validator");
const path = require("path");
const Admin = require("../models/adminModel");
const category = require("../models/categoriesModel");
const {formatTimeToIST} = require("../../utils/dateUtils");
const subCategory = require("../models/subCategoryModel");
const User = require("../models/userModel");

exports.getAllViewedBySocialUpdates = async (req, res) => {
  const {topicId} = req.body
    try {
        const topics = await YoutubeUpdates.findYoutubeUpdatesById(topicId);
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
exports.createYoutubeUpdates = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  if (!req.file) {
    return res.status(400).json({ errors: ["Image file is required."] });
  }

  const {title, description, teamId, bannerId, categoryId, subCategoryId} = req.body;
  console.log(req.body);
  const profileImagePath = req.file.path.replace(/\\/g, "/");
  const profileImageFilename = "/" + path.basename(profileImagePath);

  try {
    const date = formatTimeToIST().format('YYYY-MM-DD HH:mm:ss');
    const findcategory = await category.findCategoryById(categoryId);
    if (!findcategory) {
      return res.status(404).json({ errors: ["Category not found"] });
    }
    if(subCategoryId){
      const findSubCategory = await subCategory.findsubCategoryById(categoryId);
      if (findSubCategory.length === 0) {
        return res.status(404).json({ errors: ["SubCategory not found"] });
      }
      const findIds = findSubCategory.filter((sub) => sub.id.toString() === subCategoryId);
      console.log(findIds);
      if (findIds.length === 0) {
        return res.status(404).json({ errors: ["SubCategory not present"] });
      }
    }
    const findAdmin = await Admin.findAdminById(teamId);
    if (!findAdmin) {
      return res.status(404).json({ errors: ["Admin not found"] });
    }
    const newTopic = await YoutubeUpdates.create({
      image_path: profileImageFilename,
      url: null,
      title,
      description,
      teamId: teamId,
      bannerId: bannerId === '' ? null : bannerId,
      categoryId,
      subCategoryId: subCategoryId === '' ? null : subCategoryId,
      type: findAdmin.type,
      date: date
    });
    return res
      .status(200)
      .json({ message: "social Updates Data", data: newTopic });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

exports.getAllYoutubeUpdates = async (req, res) => {
  try {
    const banners = await YoutubeUpdates.findAllYoutubeUpdates();
    return res
      .status(200)
      .json({ message: "List Of All social updates", data: banners });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getYoutubeUpdateById = async (req, res) => {
  const { youtubeUpdateId } = req.body;

  try {
    const youtubeUpdate = await YoutubeUpdates.findYoutubeUpdatesById(
      youtubeUpdateId
    );
    if (!youtubeUpdate) {
      return res.status(404).json({ errors: ["social update not found"] });
    }
    return res.status(200).json({message: "social update", data: youtubeUpdate});
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

exports.updateYoutubeUpdate = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  const youtubeUpdateId = req.params.id;
  const {title, description, categoryId, subCategoryId } = req.body;
  let image_path;

  try {
    if (req.file) {
      let workImagePath = req.file.path.replace(/\\/g, "/");
      image_path = "/" + path.basename(workImagePath);
    }

    const updateSocailUpdate = await YoutubeUpdates.updateYoutubeUpdates(youtubeUpdateId,{
      title,
      description,
      image_path,
      categoryId,
      subCategoryId
    });
    const findUpdatedYoutubeUpdate = await YoutubeUpdates.findYoutubeUpdatesById(youtubeUpdateId);
    return res
      .status(200)
      .json({
        message: "Youtube Update updated successfully",
        data: findUpdatedYoutubeUpdate,
      });
  } catch (error) {
    console.error("Error in updateBanner:", error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

exports.deleteYoutubeUpdate = async (req, res) => {
  const youtubeUpdateId = req.params.id;

  try {
    const success = await YoutubeUpdates.deleteYoutubeUpdates(youtubeUpdateId);

    if (!success) {
      return res.status(404).json({ errors: ["social update not found"] });
    }

    return res.json({ message: "social update deleted successfully" });
  } catch (error) {
    console.error("Error in deleteBanner:", error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};



exports.updateYoutubeUpdateStatus = async (req, res) => {
  const { youtubeUpdateId, status, teamId } = req.body;
  try {
    const findYoutubeUpdatesById = await YoutubeUpdates.findYoutubeUpdatesById(youtubeUpdateId);
    if (!findYoutubeUpdatesById) {
      return res.status(404).json({ errors: ["social update not found"] });
    }

    const findAdmin = await Admin.findAdminById(teamId);
    if(findAdmin.type !== 'admin') {
      return res.status(404).json({ errors: ['Only Admins can update social updates'] });
    }

    const updateYoutubeUpdateStatus = await YoutubeUpdates.updateYoutubeUpdateSttaus(youtubeUpdateId, status, formatTimeToIST().format('YYYY-MM-DD'), formatTimeToIST().format('HH:mm:ss'));
    return res.status(200).json({ message: `social update ${status === '1' ? 'accepted' : 'rejected'} successfully` });
  }catch(error){
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
}


exports.getAllYoutubeUpdatesByAdmin = async (req, res) => {
  const {teamId} = req.body
  try {
    const findAdmin = await Admin.findAdminById(teamId);
    if(!findAdmin) {
      return res.status(404).json({ errors: ['Admin not found'] });
    }
    let topics;
    if(findAdmin.type === 'admin') {
      topics = await YoutubeUpdates.findAllYouTubeUpdatesOnlyAdmin();
    }else{
      topics = await YoutubeUpdates.findAllYouTubeUpdatesByAdmin(teamId);
    }
    const findImages = await processTrendingTopics(topics);
    return res.status(200).json({ message: 'List Of All Socail Updates', data: findImages });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}


exports.getAllViewedBySocailUpdates = async (req, res) => {
  const {socialUpdatesId} = req.body
    try {
        const topics = await YoutubeUpdates.findYoutubeUpdatesById(socialUpdatesId);
        if(!topics) {
          return res.status(404).json({ errors: ['Social Update not found'] });
        }
        if(topics.viewedBy === null){
          return res.status(404).json({ errors: ['No People Viewed this Social Update'] });
        }
        const viewedByArray = JSON.parse(topics.viewedBy);
        console.log(viewedByArray);
        const removeDublicate = new Set(viewedByArray);
        const viewedBy = [...removeDublicate]; 
        console.log(viewedBy);
        const findUserDetails = viewedBy.map(async (userId) => {
          const user = await User.findUserById(userId);
          return {userId, name: `${user.firstName} ${user.lastName}`, image_path: user.profile_image};
        })    
        return res.json({ message: 'List Of All Social Update Viewers', data: await Promise.all(findUserDetails) });
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
  const {socailUpdateId, teamId} = req.body;
  try {
    if(!req.file) {
      return res.status(400).json({ errors: ['Image file is required'] });
    }
    const findTopic = await YoutubeUpdates.findYoutubeUpdatesById(socailUpdateId);
    if (!findTopic) {
      return res.status(404).json({ errors: ['Socail Update not found'] });
    }
    const findAdmin = await Admin.findAdminById(teamId);
    if(findAdmin.type !== 'admin') {
      return res.status(404).json({ errors: ['Only Admins can update banners'] });
    }
    const profileImagePath = req.file.path.replace(/\\/g, '/');
    const profileImageFilename = '/' + path.basename(profileImagePath);
    console.log(profileImageFilename);
    const updateTopicById = await YoutubeUpdates.updateYoutubeUpdateBannerData(socailUpdateId, profileImageFilename);
    return res.status(200).json({ message: 'Social Update updated successfully' });
  } catch (error) {
      console.error(error);
      return res.status(407).json({ errors: ['Something went wrong'] });
  }
};


exports.deleteBannerData = async (req, res) => {
  const {socailUpdateId, teamId} = req.body;
  try {
    const findTopic = await YoutubeUpdates.findYoutubeUpdatesById(socailUpdateId);
    if (!findTopic) {
      return res.status(404).json({ errors: ['Social Update not found'] });
    }
    const findAdmin = await Admin.findAdminById(teamId);
    if(findAdmin.type !== 'admin') {
      return res.status(404).json({ errors: ['Only Admins can delete banners'] });
    }
    const updateTopicById = await YoutubeUpdates.updateYoutubeUpdateBannerData(socailUpdateId, null);
    return res.status(200).json({ message: 'Social Update deleted successfully' });
  } catch (error) {
      console.error(error);
      return res.status(407).json({ errors: ['Something went wrong'] });
  }
};



exports.updateSelectedSocailUpdateStatus = async (req, res) => {
  const {socailUpdatesId, status, teamId} = req.body;
  try {
    const findTrendingTopic = await YoutubeUpdates.findYoutubeUpdatesById(socailUpdatesId);
    if(!findTrendingTopic) {
      return res.status(404).json({ errors: ['Social Update not found'] });
    }
    const findAdmin = await Admin.findAdminById(teamId);
    if(findAdmin.type !== 'admin') {
      return res.status(404).json({ errors: ['Only Admins can update selected topics'] });
    }
    const updateStatus = await YoutubeUpdates.updateSelectedTopicStatus(socailUpdatesId, status);
    return res.status(200).json({ message: `Social Update selected Successfully` });
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
        return { ...topic, clicks: [] };
      }  
      const lastSixViewedBy = [...viewedByArray].slice(-6).reverse();
      const profileImagesPromises = lastSixViewedBy.map(id => User.findUserById(id));
      const profileImages = await Promise.all(profileImagesPromises).then(profiles => profiles.map(profile => profile.profile_image));
      topic.clicks = profileImages;
      return topic;
    } catch (error) {
      console.error(`Error processing topic ID ${topic.id}:`, error);
      return { ...topic, clicks: [] }; 
    }
  }));
}





