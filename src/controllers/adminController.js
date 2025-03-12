const Admin = require("../models/adminModel");
const jwt = require("jsonwebtoken");
const { formatTimeToIST } = require("../../utils/dateUtils");
const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const path = require("path");
const {sendForgotPasswordEmail} = require('../../utils/forgetPasswordUtils')
require("dotenv").config();

exports.createAdmin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  const {
    name,
    mobile,
    type,
    email,
    password,
    users,
    topics,
    socialupdate,
    posts,
  } = req.body;
  try {
    const findEmail = await Admin.findAdminByEmail(email);
    if (findEmail) {
      return res.status(400).json({ errors: ["Email already exists"] });
    }
    const findMobile = await Admin.findByMobile(mobile);
    if (findMobile) {
      return res.status(400).json({ errors: ["Mobile No already exists"] });
    }
    const saltRound = 10;
    const hash = await bcrypt.hash(password, saltRound);
    const admin = await Admin.create({
      name,
      mobile,
      type: "team",
      date: formatTimeToIST().format("YYYY-MM-DD hh:mm:ss A"),
      email,
      password: hash,
      dashboard:1,
      users,
      revenue: 0,
      services: 0,
      withdraw: 0,
      googleads: 0,
      topics,
      socialupdate,
      posts,
      notification: 0,
      updateversion: 0,
      settings: 0,
      teams: 0,
    });
    const findUserByMobile = await Admin.findByMobile(mobile);
    const generateToken = jwt.sign(
        { id: findUserByMobile.id, name: name, type: type },
        process.env.SECRET_KEY
      );
    await Admin.updateApiToken(findUserByMobile.id, generateToken);
    return res.status(200).json(findUserByMobile);
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await Admin.checkAdminCredentaials(email);
    if (!user) {
      return res.status(401).json({ errors: ["Invalid credentials"] });
    }
    const Password = await bcrypt.compare(password, user.password);
    if (!Password) {
      return res.status(401).json({ errors: ["Invalid credentials"] });
    }
    if(user.userStatus === 1) {
      return res.status(401).json({ errors: ["User is Blocked"] });
    }
    const data = {
      id: user.id,
      email: user.email,
      name: user.name,
      password: user.password,
      token: user.apiToken,
      userType: user.type,
      dashboard: user.dashboard,
      users: user.users,
      revenue: user.revenue,
      services: user.services,
      withdraw: user.withdraw,
      googleads: user.googleads,
      topics: user.topics,
      socialupdate: user.socialupdate,
      posts: user.posts,
      notification: user.notification,
      updateversion: user.updateversion,
      settings: user.settings,
      teams: user.teams,
    };
    return res
      .status(200)
      .json({ status: true, msg: "Login successful", data: data });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

exports.getAllTeamMember = async (req, res) => {
  try {
    const teamMember = await Admin.findAllTeamMember();
    return res.status(200).json({
      status: true,
      msg: "List of all team members",
      data: teamMember,
    });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};

exports.updateTeamMember = async (req, res) => {
  const { name, mobile, email, password, dashboard, users, topics, socialupdate, posts } =
    req.body;
  const teamId = req.params.id;
  let image;
  try {
    if (req.file) {
      let adminImagePath = req.file.path.replace(/\\/g, "/");
      image = "/" + path.basename(adminImagePath);
    }

    let hashedPassword;
    if (password) {
      const saltRound = 10;
      hashedPassword = await bcrypt.hash(password, saltRound);
    }

    const updatedData = {
      name,
      email,
      mobile,
      dashboard,
      users,
      topics,
      socialupdate,
      posts,
    };
    if (image) {
      updatedData.image = image;
    }
    if (hashedPassword) {
      updatedData.password = hashedPassword;
    }

    const admin = await Admin.updateTeamMember(teamId, updatedData);
    const findUserByMobile = await Admin.findAdminById(teamId);
    return res
      .status(200)
      .json({
        status: true,
        msg: "Team member updated successfully",
        data: findUserByMobile,
      });
  } catch (error) {
    console.error(error);
  }
};

exports.deleteTeamMember = async (req, res) => {
  const teamId = req.params.id;
  try {
    const admin = await Admin.deleteTeamMember(teamId);
    if (!admin) {
      return res.status(404).json({ errors: ["Team member not found"] });
    }
    return res
      .status(200)
      .json({ status: true, msg: "Team member deleted successfully" });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
};


exports.forgetPassword = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await Admin.findAdminByEmail(email);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const saltRound = 10;
    const hash = await bcrypt.hash(newPassword, saltRound);
    await Admin.updatePassword(user.id, hash);
    const sendMail = await sendForgotPasswordEmail(email, newPassword);
    if (!sendMail) {
      return res.status(400).json({ errors: ["Failed to send email"] });
    }
    return res.status(200).json({ msg: "Password email sent successfully" });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
}


exports.updateStatusOfTeamMember = async (req, res) => {
  const teamId = req.params.id;
   const { blockstatus } = req.body;
  try {
    const admin = await Admin.updateStatus(teamId, blockstatus);
    if (!admin) {
      return res.status(404).json({ errors: ["Team member not found"] });
    }
    return res
      .status(200)
      .json({ status: true, msg: "Team member status updated successfully" });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
}



exports.updateAdmin = async (req, res) => {
  const { name, email, mobile, password } = req.body;
  const adminId = req.params.id;
  try {
    let image;
    if(req.file){
      let adminImagePath = req.file.path.replace(/\\/g, "/");
      image = "/" + path.basename(adminImagePath);
    }
    if(email){
      const findEmail = await Admin.findAdminByEmail(email);
      if (findEmail) {
        return res.status(400).json({ errors: ["Email already exists"] });
      }
    }
    if(mobile){
      const findMobile = await Admin.findByMobile(mobile);
      if (findMobile) {
        return res.status(400).json({ errors: ["Mobile No already exists"] });
      }
    }
    let hashedPassword;
    if(password){
      const saltRound = 10;
      hashedPassword = await bcrypt.hash(password, saltRound);
      await Admin.updatePassword(adminId, hashedPassword);
    }
    const admin = await Admin.updateAdmin(adminId,{
      image,
      name,
      email,
      mobile,
      password: hashedPassword
    });
    const findAdmin = await Admin.findAdminById(adminId);
    return res
      .status(200)
      .json({ status: true, msg: "Admin updated successfully", data: findAdmin });
  } catch (error) {
    console.error(error);
    return res.status(407).json({ errors: ["Something went wrong"] });
  }
}