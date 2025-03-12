const User = require("../models/userModel");
const Dashboard = require("../models/dashboardModel");
const { validationResult } = require("express-validator");
const Category = require("../models/categoriesModel");
const {sendForgotPasswordEmail} = require("../../utils/forgetPasswordUtils");
const path = require("path");
const jwt = require("jsonwebtoken");
const { isEmail } = require("validator");
const UserActions = require("../models/userActionsModel");
const {formatTimeToIST} = require("../../utils/dateUtils");
const payment = require("../models/paymentModel");
const pool = require("../../db");
const savedCategory = require("../models/savedCategoryModel");
const {getNotificationTypeDate} = require("../../utils/dateUtils");
const userVerfication = require('../models/userVerficationModel');
const Payment = require("../models/paymentModel");
require("dotenv").config();

exports.getAllUsers = async (req, res) => {
  try {
    let {searchName,serchType} = req.body;
    let users;
    if(serchType === ""){
      users = await User.findAllUsers('all',null,null,searchName);
    }else{
    const todaysDate = formatTimeToIST().format('YYYY-MM-DD');
    const findNotificationDate = await getNotificationTypeDate(serchType);
    console.log(findNotificationDate);
      users = await User.findAllUsers(serchType,todaysDate, findNotificationDate,searchName);
    }
    const data = users.map((user) => {
      return {...user, userFullName: `${user.firstName} ${user.lastName}`}
    })
    return res.status(200).json({msg:"All Users",data:data});
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

exports.getUserById = async (req, res) => {
  const {userId} = req.body;
  try {
    const user = await User.findUserById(userId);
    if (!user) {
      return res.status(404).json({ errors: ["User not found"] });
    }
    return res.json(user);
  } catch (error) {
    console.error(error);
    return res.status(407).json({ error: ["Something went wrong"] });
  }
};

exports.createUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  const { firstName, lastName, email, password, mobile } = req.body;
  const device_token = req.body.device_token || '';
  try {

    const userDubEmail = await User.findOneByEmail(email);
    if (userDubEmail) {
      return res.status(400).json({ errors: ["Email already exists"] });
    }
    const userDunPassword = await User.findOneByMobile(mobile);
    if (userDunPassword) {
      return res.status(400).json({ errors: ["Mobile No already exists"] });
    }
    const findUserBlock = await User.checkDeviceTokenStatus(device_token);
    if(findUserBlock.length > 0) {
      return res.status(401).json({ errors: ["User is Blocked"] });
    }
    const date = formatTimeToIST().format('YYYY-MM-DD hh:mm:ss A');
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      mobile,
      device_token,
      registrationDate: formatTimeToIST().format('YYYY-MM-DD HH:mm:ss'),
    });
    const createdUser = await User.findOneByEmail(email);
    const pathName = req.path;
    const createUserAction = await UserActions.create({
      userId: createdUser.id,
      actions: pathName,
      date: date
    })
    const token = jwt.sign(
      { id: createdUser.id, email: createdUser.email },
      process.env.SECRET_KEY
    );
    await User.updateApiToken(createdUser.id, token);
    const tokenData = {
      id: createdUser.id,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      email: createdUser.email,
      mobile: createdUser.mobile,
      password: createdUser.password,
      is_active: createdUser.is_active,
      device_token: createdUser.device_token,
      token: token,
    };
    return res.status(200).json({ message: "User Data", tokenData });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

exports.login = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  const { email, password } = req.body;
  const device_token = req.body.device_token || '';

  try {
    const user = await User.checkCredentials(email, password);
    if (!user) {
      return res.status(401).json({ errors: ["Invalid credentials"] });
    }
    const findUserBlock = await User.checkDeviceTokenStatus(device_token);
    if(findUserBlock.length > 0) {
      return res.status(401).json({ errors: ["User is Blocked"] });
    }
    const date = formatTimeToIST().format('YYYY-MM-DD hh:mm:ss A');
    await User.updateDeviceToken(email, device_token);
    await Dashboard.setIs_Active(email, password, formatTimeToIST().format('DD-MM-YYYY hh:mm:ss A'));
    const updatedUser = await User.findOneByEmail(email);
    const pathName = req.path;
    const createAction = await UserActions.create({
      userId: updatedUser.id,
      actions: pathName,
      date: date
    });
    let token = null;
    token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.SECRET_KEY,
    );
    await User.updateApiToken(user.id, token);
    
    const tokenData = {
      id: updatedUser.id,
      name: `${updatedUser.firstName} ${updatedUser.lastName}`,
      email: updatedUser.email,
      is_active: updatedUser.is_active,
      token: token||user.apiToken,
    };
    return res.status(200).json({ message: "Login successful", tokenData });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { firstName, lastName, email, password, mobile } = req.body;

  console.log(`loggging user ${userId}`);
  
  try {
    const user = await User.updateUser(userId, {
      firstName,
      lastName,
      email,
      password,
      mobile,
    });
    console.log(`loggging user ${user}`);
    if (!user) {
      return res.status(404).json({ errors: ["User not found"] });
    }
    const findUpdatedUser = await User.findUserById(userId);
    return res.status(200).json(findUpdatedUser);
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
};

exports.updateProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  const userId = req.params.id;
  let profileImageFilename, workImageFilename;
  if (req.body.profile_image && (!req.files || !req.files["profile_image"])) {
    return res
      .status(400)
      .json({ errors: ["Profile image file is required for update."] });
  }

  if (req.body.work_image && (!req.files || !req.files["work_image"])) {
    return res
      .status(400)
      .json({ errors: ["Work image file is required for update."] });
  }
  let {
    firstName,
    lastName,
    email,
    password,
    mobile,
    fullname,
    about,
    work_video,
    language,
    price,
    amountType,
    star,
    state,
    city,
    timeline,
    responseTime,
    instagramUrl,
    twitterUrl,
    youtubeUrl,
    facebookUrl,
    edited,
    thumbnail,
    country
  } = req.body;

  try {
    if (req.files["profile_image"]) {
      let profileImagePath = req.files["profile_image"][0].path.replace(
        /\\/g,
        "/"
      );
      profileImageFilename = "/" + path.basename(profileImagePath);
    }

    if (req.files["work_image"]) {
      let workImagePath = req.files["work_image"][0].path.replace(/\\/g, "/");
      workImageFilename = "/" + path.basename(workImagePath);
    }

    const findUser = await User.findUserById(userId);
    if (!findUser) {
      return res.status(404).json({ errors: ["User not found"] });
    }

    // if (email) {
    //   const existingUserWithEmail = await User.findOneByEmail(email);
    //   if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
    //     return res.status(400).json({ error: 'Email is already in use by another user.' });
    //   }
    // }

    // if (mobile) {
    //   const existingUserWithEmail = await User.findOneByMobile(mobile);
    //   if (existingUserWithEmail && existingUserWithEmail.id !== userId) {
    //     return res.status(400).json({ error: 'Mobile No is already in use by another user.' });
    //   }
    // }
    let newEmail = findUser.email;
    if(email){
      let cleanedEmail = email.trim().replace(/\s/g, '');  

      const isEmailValid = cleanedEmail !== undefined && cleanedEmail.trim() !== "";
  
      if (isEmailValid && !isEmail(cleanedEmail.trim())) {
        newEmail = cleanedEmail;
        return res.status(400).json({ errors: ["Invalid email format."] });
      }
    }

    const newPassword =
      password !== undefined && password.trim() !== ""
        ? password
        : findUser.password;

    let newMobile = findUser.mobile;
    if(mobile){
      const validMobile = /^\d{10}$/;
      let cleanedMobile = mobile.trim().replace(/\s/g, '');  
      const isValidMobile = cleanedMobile !== undefined && cleanedMobile !== "";
      if (isValidMobile && !validMobile.test(cleanedMobile)) {
        newMobile = cleanedMobile;
        return res.status(400).json({ errors: ['Invalid mobile number format. Please enter a 10-digit number.'] });
      }
    }
        
    const newFullName =
      firstName || lastName
        ? `${firstName || findUser.firstName} ${lastName || findUser.lastName}`
        : findUser.fullname;

    const userToUpdate = {
      firstName,
      lastName,
      email: newEmail || email,
      password: newPassword || password,
      mobile: newMobile || mobile,
      fullname: newFullName || fullname,
      about,
      work_video,
      language,
      price,
      amountType,
      star,
      state,
      city,
      timeline,
      responseTime,
      instagramUrl,
      twitterUrl,
      youtubeUrl,
      facebookUrl,
      edited,
      thumbnail,
      country
    };
    if (profileImageFilename) {
      userToUpdate.profile_image = profileImageFilename;
    }
    if (workImageFilename) {
      userToUpdate.work_image = workImageFilename;
    }
    const user = await User.updateUserProfile(userId, userToUpdate);

    if (!user) {
      return res.status(404).json({ errors: ["User not found"] });
    }

    const findUpdatedUser = await User.findUserById(userId);
    return res.status(200).json(findUpdatedUser);
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

exports.getUserProfile = async (req, res) => {
  const { userId } = req.body;
  try {
    const userProfile = await User.findUserById(userId);
    if (!userProfile) {
      return res.status(404).json({ errors: ["User not found"] });
    }
    let savedCategoryId = null;
    let savedSubCategoryId = null;
    let savedCategoryName = null;
    let savedSubCategoryName = null;
    const findSavedCategory = await savedCategory.findSavedCategoryByUserId(
      userId
    )
    if (findSavedCategory) {
      savedCategoryId = findSavedCategory.categoryId
      savedSubCategoryId = findSavedCategory.subcategory
      savedCategoryName = findSavedCategory.catname
      savedSubCategoryName = findSavedCategory.subcatname
    }
    return res.status(200).json({
      msg: "Profile of the user",
      data: {
        ...userProfile,
        savedCategoryId,
        savedSubCategoryId,
        savedCategoryName,
        savedSubCategoryName
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

exports.deleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const success = await User.deleteUser(userId);

    if (!success) {
      return res.status(404).json({ errors: ["User not found"] });
    }

    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    return res.status(407).json({ error: "Internal Server Error" });
  }
};

exports.getAllUserAsCreator = async (req, res) => {
    const {userId,page} = req.body;
  try {
    let users = await User.findAllUsersCreatorIsTrue(page);
    let filterData = users.data.filter((user) => user.id.toString() !== userId);
    const result = {
      msg: "all creators",
      totalPages: users.totalPages,
      currentPage: users.currentPage,
      data: filterData,
    }
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
};

exports.updateIsCreator = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  const newIsCreatorValue = req.body.is_creator;
  const userId = req.params.id;
  try {
    await User.updateIsCreator(userId, newIsCreatorValue);

    return res.status(200).json({ msg: "is_creator updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
};

exports.filterUsers = async (req, res) => {
  const { filterBy, timeRange } = req.query;
  try {
    const users = await User.getUsersByFilterAndTime(filterBy, timeRange);
    return res.status(200).json({ msg: `users filtered by ${filterBy} for ${timeRange}`, data: users });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }

};

exports.updateIsCollaborator = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  const newIsCollaboratorValue = req.body.is_collaborator;
  const userId = req.params.id;
  try {
    await User.updateIsCollaborator(userId, newIsCollaboratorValue);
    return res.status(200).json({ msg: "is_collaborator updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}


exports.updateCollaborator = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  const userId = req.params.id;
  let channel_image;
  let categoryName;
  const {channelName, subscribers, categoryId} = req.body;
  try {
    if(req.file){
      if (req.file.size === 0) {
        return res.status(400).json({ error: "File is empty" });
      }
    const profileImagePath = req.file.path.replace(/\\/g, '/');
    channel_image = '/' + path.basename(profileImagePath);
    }
    const findCollaborator = await User.findUserById(userId);
    if (findCollaborator.is_collaborator === false) {
      return res.status(400).json({ error: "User is not a collaborator" });
    }
    const findCategory = await Category.findCategoryById(categoryId)
    if (!findCategory) {
      return res.status(404).json({ error: "Category not found" });
    }
    categoryName = findCategory.name;
    const updatedCollaborator = await User.updateCollaboratorDetails(userId, channelName, subscribers, channel_image||null, categoryName, categoryId);
    if(!updatedCollaborator) {
      return res.status(404).json({ error: "User not found" });
    }
    const findUpdatedCollaborator = await User.findUserById(userId);
    return res.status(200).json({ msg: "Collaborator updated successfully", data: findUpdatedCollaborator });
  }catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


exports.getAllCollaborators = async (req, res) => {
  const {userId,page} = req.body;
  try {
    let getAllCollaborators = await User.findAllUsersCollaboratorIsTrue(page);
    let filterData = getAllCollaborators.data.filter(user => user.id.toString() !== userId);
    const result = {
      msg: "all collaborators",
      totalPages: getAllCollaborators.totalPages,
      currentPage: getAllCollaborators.currentPage,
      data: filterData,
    }
    return res.status(200).json(result);
  }catch(error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


exports.getCreatorById = async (req, res) => {
  const userId = req.params.id;
  try {
    const getCreatorById = await User.findCreatorById(userId);
    if(!getCreatorById) {
      return res.status(404).json({ error: "Creator not found" });
    }
    return res.status(200).json({ msg: "Creator details", data: getCreatorById });
  }catch(error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

exports.forgetPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOneByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const sendMail = await sendForgotPasswordEmail(email, newPassword);
    if (!sendMail) {
      return res.status(400).json({ error: "Failed to send email" });
    }
    return res.status(200).json({ msg: "Password email sent successfully" });
  }catch(error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}



exports.updateUserStatus = async (req, res) => {
  const userId = req.params.id;
  const {blockstatus} = req.body;
  try {
    const user = await User.findUserById(userId);
    if (!user) {
      return res.status(404).json({ errors: ["User not found"] });
    }
    const updatedUser = await User.updateStatus(userId, blockstatus);
    return res.status(200).json({ msg: "User status updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
}


exports.getAllCount = async (req, res) => {
  const {searchBy} = req.body;
  try {
    let getAllCreatorCount;
    if(searchBy==='creator') {
      getAllCreatorCount = await User.findAllUsersCreatorIsTrue()
    }else if(searchBy==='collaborator') {
      getAllCreatorCount = await User.findAllUsersCollaboratorIsTrue()
    }
    return res.status(200).json({ msg: `all ${searchBy} count`, data: getAllCreatorCount.length });
  }catch(error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}


exports.getUsersActionById = async (req, res) => {
  const {userId} = req.body;
  try {
    const date =  await formatTimeToIST().format('YYYY-MM-DD');
    const findUser = await User.findUserById(userId);
    if(!findUser) {
      return res.status(404).json({ errors: ["User not found"] });
    }
    const usersAction = await UserActions.findActionByUserIdAndDate(userId, date);
    if(usersAction.length===0) {
      return res.status(404).json({ errors: ["No Action For Today"] });
    }
    const modifiedData = usersAction.map(action => ({
      ...action,
      profileImage: findUser.profile_image,
      fullName: `${findUser.firstName} ${findUser.lastName}`
    }));

    return res.status(200).json({ msg: "get all user action", data: modifiedData });
  }catch(error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}


exports.updateshowBanner = async (req, res) => {
  const userId = req.params.id;
  const {showBanner} = req.body;
  try {
    const user = await User.findUserById(userId);
    if (!user) {
      return res.status(404).json({ errors: ["User not found"] });
    }
    const updatedUser = await User.updateShowBanner(userId, showBanner);
    return res.status(200).json({ msg: "User show banner status updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
}


exports.getGoogleBannersByUserId = async (req, res) => {
  const {userId} = req.body;
  try {
    const user = await User.findUserById(userId);
    if (!user) {
      return res.status(404).json({ errors: ["User not found"] });
    }
    const getSettings = await payment.getGoogleAdds();
    let result;
    if(user.showBanner===0) {
      result = {
        interstitial_ad: getSettings[0].interstitial_ad_details_key,
        banner_ad: getSettings[0].topic_ad_details_key,
        native_ad: getSettings[0].notification_ad_details_key,
        rewarded_ad: getSettings[0].home_details_ad_key_1
      }
    }else if(user.showBanner===1) {
        result = {
          interstitial_ad: null,
          banner_ad: null,
          native_ad: null,
          rewarded_ad: null
        }
    }
    return res.status(200).json({ msg: "get all user action", data: result });
  }catch(error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}


exports.addViews = async (req, res) => {
  const {userId} = req.body;
  try {
    const user = await User.findUserById(userId);
    if (!user) {
      return res.status(404).json({ errors: ["User not found"] });
    }
    const updatedUser = await User.addViewsOfUser(userId);
    return res.status(200).json({ msg: "User views updated successfully" });
  }catch(error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}


exports.getAllUserCountDashboard = async (req, res) => {
  try {
      const allUserCount = await User.findAllUsers('all');
      const date = formatTimeToIST().subtract(1, 'days').format('YYYY-MM-DD');
      const yestardayRegisteredUser = await Dashboard.getAllYestardayRegisteredUsers(date);
      const todayRegisteredUser = await Dashboard.getAllYestardayRegisteredUsers(formatTimeToIST().format('YYYY-MM-DD'));
      const liveUser = await Dashboard.countLiveUsers();
      const yestardayLiveUser = await Dashboard.countLiveUsersYestarday();
      const activeUser = await Dashboard.getActiveUsers();
      const getCreator = await User.findAllWeekCreatorWithTodayCreators(formatTimeToIST().format('YYYY-MM-DD'), formatTimeToIST().subtract(7, 'days').format('YYYY-MM-DD'),formatTimeToIST().format('YYYY-MM-DD'));
      const data = {
        users:{
        totalUsers: allUserCount.length,
        yesterdayRegisteredUsers: yestardayRegisteredUser.length,
        todayRegisteredUsers: todayRegisteredUser.length,
        liveUser: liveUser,
        yestardayLiveUser: yestardayLiveUser
        },
        status:{
          totalActiveUser: activeUser.length,
          activeUser: activeUser.length,
          inactiveUser: allUserCount.length - activeUser.length
        },
        paid:{
          totalPaidUser: allUserCount.filter(user => user.is_paid==='YES').length,
          paidUser: allUserCount.filter(user => user.is_paid==='YES').length,
          unpaidUser: allUserCount.filter(user => user.is_paid==='NO').length,
          yestardayJoin: yestardayRegisteredUser.filter(user => user.is_paid==='YES').length,
          todayJoin: todayRegisteredUser.filter(user => user.is_paid==='YES').length
        },
        creator:{
          totalCreator: allUserCount.filter(user => user.is_creator===1).length,
          paidCreator: allUserCount.filter(user => user.is_paid==='YES'&& user.is_creator===1).length,
          unpaidCreator: allUserCount.filter(user => user.is_paid==='NO' && user.is_creator===1).length,
          approvedCreator: allUserCount.filter(user => user.is_creator===1).length,
          unapproavedCreator: allUserCount.filter(user => user.is_creator===0).length,
          latestCreator: getCreator.week_count,
          todayCreator: getCreator.today_count
        },
        collaborator:{
          totalCollaborator: allUserCount.filter(user => user.is_collaborator===1).length,
          activeCollaborator: allUserCount.filter(user => user.is_collaborator===1).length,
          inactiveCollaborator: allUserCount.filter(user => user.is_collaborator===0).length,
          liveUser: liveUser
        }
      }
    return res.status(200).json({ msg: `all user meta data`, data: data });
  }catch(error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}



exports.createVerification = async (req, res) => {
  const {type,userId,verificationLink} = req.body;
  try {
    const user = await User.findUserById(userId);
    if (!user) {
      return res.status(404).json({ errors: ["User not found"] });
    }
    if(user.is_creator!==1) {
      return res.status(404).json({ errors: ["Only creator can create verification"] });
    }
    const userVerificationData = await userVerfication.findUserVerficationById(userId);
    if(userVerificationData && userVerificationData.isVerified==='0') {
      return res.status(404).json({ errors: ["You have a verfiication in pending state"] });
    }
    const createVerification = await userVerfication.create({
      userId,
      isVerified:'0',
      verifiedOn: type,
      verificationLink,
      verifiedDate: formatTimeToIST().format('YYYY-MM-DD HH:mm:ss')
    })
    await User.updateVerification(userId,verificationLink);
    return res.status(200).json({ msg: "Verification done successfully" });
  }catch(error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}



exports.createUserAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  const { firstName, lastName, email, password, mobile, device_token } = req.body;
  try {

    const userDubEmail = await User.findOneByEmail(email);
    if (userDubEmail) {
      return res.status(400).json({ errors: ["Email already exists"] });
    }
    const userDunPassword = await User.findOneByMobile(mobile);
    if (userDunPassword) {
      return res.status(400).json({ errors: ["Mobile No already exists"] });
    }
    const date = formatTimeToIST().format('YYYY-MM-DD hh:mm:ss A');
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      mobile,
      registrationDate: formatTimeToIST().format('YYYY-MM-DD HH:mm:ss'),
    });
    const createdUser = await User.findOneByEmail(email);
    const pathName = req.path;
    const createUserAction = await UserActions.create({
      userId: createdUser.id,
      actions: pathName,
      date: date
    })
    const token = jwt.sign(
      { id: createdUser.id, email: createdUser.email },
      process.env.SECRET_KEY
    );
    await User.updateApiToken(createdUser.id, token);
    const tokenData = {
      id: createdUser.id,
      firstName: createdUser.firstName,
      lastName: createdUser.lastName,
      email: createdUser.email,
      mobile: createdUser.mobile,
      password: createdUser.password,
      is_active: createdUser.is_active,
      device_token: createdUser.device_token,
      token: token,
    };
    return res.status(200).json({ message: "User Data", tokenData });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};



exports.getAllUserVerification = async (req, res) => {
  try{
    const userVerification = await userVerfication.findAllUserVerification();
    return res.status(200).json({ msg: `all user verification`, data: userVerification });
  }catch(error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}



exports.getChartOfVerifiedUser = async (req, res) => {
  try{
    const allUserVerified = await userVerfication.findAllUserVerification();
    const userVerification = await userVerfication.getChartOfUserVerification();
    const findAllPyment = await Payment.findAllPayments();
    const data = {
      unverifiedCreator: allUserVerified.length - userVerification,
      verifiedCreator: userVerification,
      verfificationVedio: findAllPyment[0].verificationVedioLink,
      verficationText: findAllPyment[0].verificationText
    }
    return res.status(200).json({ msg: `all user verification`, data: data });
  }catch(error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}



exports.updateVerificationRequest = async (req, res) => {
  const { id , isVerified} = req.body;
  console.log(req.body);
  try {
    const userVerificationData = await userVerfication.finduserVerificationByverificationId(id);
    if(!userVerificationData) {
      return res.status(404).json({ errors: ['Verification not found'] });
    }
    await userVerfication.updateuserVerificationByverificationId(id, isVerified);
    await User.updateVerfication(userVerificationData.userId, isVerified);
    return res.status(200).json({ msg: `verification request ${isVerified==='1'?'accepted':'rejected'} successfully`});
  }catch(error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}



exports.selectCreator = async (req, res) => {
  const { id, selectCreator } = req.body;
  try {
    const user = await User.findUserById(id);
    if(!user) {
      return res.status(404).json({ errors: ['User not found'] });
    }
    if(selectCreator=='1'){
      if(user.is_creator!==1){
        return res.status(400).json({ errors: ['User is not a creator'] });
      }
      if(user.is_collaborator!==1){
        return res.status(400).json({ errors: ['User is not a collaborator'] });
      }
      if(user.verified!=1){
        return res.status(400).json({ errors: ['User is not verified'] });
      }
      const getAllUser = await User.findAllUsers("all",null,null,'');
      const data = getAllUser.filter((item) => item.selectedCreator == 1);
      if(data.length > 10) {
        return res.status(400).json({ errors: ['Maximum 10 creators can be selected'] });
      }
    }
    const selectCreatorData = await User.updateSelectCreator(id, selectCreator);
    return res.status(200).json({ msg: `creator selected successfully`});
  }catch(error) {
    console.error(error);
    return res.status(407).json({ errors: ['Something went wrong'] });
  }
}


