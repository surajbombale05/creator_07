const jwt = require('jsonwebtoken');
const pool = require("../../db");
const Admin = require("../models/adminModel");
const UserActions = require("../models/userActionsModel");
const User = require('../models/userModel');
require('dotenv').config()
const {formatTimeToIST} = require('../../utils/dateUtils');

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ errors: ['Access denied. No token provided.'] });
  }

  try {
    const decoded = jwt.verify(token,process.env.SECRET_KEY );
    req.userId = decoded.id; 

    const userBlock = await User.findUserById(req.userId);
    if(userBlock.userStatus === 1) {
      return res.status(401).json({ errors: ['User is Blocked'] });
    }
    const date = await formatTimeToIST().format('DD-MM-YYYY hh:mm:ss A');
    const updateQuery = 'UPDATE users SET is_active = 1 , lastActive = ? WHERE id = ?';
    await pool.execute(updateQuery, [date,req.userId]);
    const pathName = req.path;
    await UserActions.create({
      userId: req.userId,
      actions: pathName,
      date: formatTimeToIST().format('YYYY-MM-DD HH:mm:ss A')
    })
    return next();
  } catch (error) {
    return res.status(401).json({ errors: ['Invalid token.'] });
  }
};

const checkUserAuthorization = async (req, res, next) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized. User ID not provided.' });
  }
  const requestedUserId = req.params.id; 
  if (userId !== parseInt(requestedUserId)) {
    return res.status(403).json({ error: 'Forbidden. User not authorized.' });
  }

  try {
    const [result] = await pool.execute('SELECT * FROM users WHERE id = ?', [userId]);

    if (!result.length) {
      return res.status(403).json({ error: 'Forbidden. User not authorized.' });
    }

    return next();
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const verifyAdminToken = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token,process.env.SECRET_KEY );
    req.userId = decoded.id; 
    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = { verifyToken, checkUserAuthorization, verifyAdminToken };
