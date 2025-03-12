const express = require('express');
const bodyParser = require('body-parser');
const apiRouter = require('./route')
const {startScheduledTask,scheduleNotifications} = require('./src/controllers/cronController'); 
const {formatDateUTC} = require('./utils/dateUtils');
const path = require('path'); 
const pool = require('./db'); 
const momment = require('moment-timezone');
const {formatTimeToIST} = require('./utils/dateUtils')
 const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.use(express.static("public/profileImages"));
app.use(express.static("public/creatorImages"));
app.use(express.static('public/bannerImages'));
app.use(express.static("public/serviceModuleImages"));
app.use(express.static("public/topicsImages"));
app.use(express.static("public/trendingTopicImages"));
app.use(express.static("public/youtubeUpdateImages"));
app.use(express.static("public/servicesImages"));
app.use(express.static("public/requestProfileImages"));
app.use(express.static("public/notificationImages"));
// app.use(express.static("public/upload"));
// app.use(express.static("public"));



app.use('/public', express.static(path.join(__dirname, 'public')));

app.use('/app',apiRouter);

const timeInIst = formatTimeToIST();
console.log("Time In Ist Format",timeInIst.format('DD-MM-YYYY HH:mm:ss'))

async function testDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    console.log('Connection to the database has been established successfully.');
    connection.release();
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
}
async function fetchRemindersFromDB() {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT userId, date, time, title FROM reminders');
    connection.release();
    return rows;
  } catch (error) {
    console.error('Error fetching reminders from the database:', error);
    throw error;
  }
}

async function scheduleRemindersFromDB() {
  try {
    const reminders = await fetchRemindersFromDB();
    reminders.forEach(async (reminder) => {
      const { userId, date, time, title } = reminder;
      const notificationTime = new Date(`${date}T${time}.000Z`)
      scheduleNotifications(userId, notificationTime.getTime(), title);
    });
  } catch (error) {
    console.error('Error scheduling reminders from the database:', error);
  }
}

app.get('/healthcheck', (req, res) => {
  res.status(200).json({ status: 'UP',message:"health check successful...", timestamp: new Date().toISOString() });
});


testDatabaseConnection();
startScheduledTask();
scheduleRemindersFromDB();
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

