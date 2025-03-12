const pool = require("../../db");
const moment = require('moment');
class Dashboard {
  static async setIs_Active(email, password, date) {
    const updateQuery = 'UPDATE users SET is_active = 1, lastActive = ? WHERE email = ? AND password = ?';

    try {
        const [updateResult] = await pool.execute(updateQuery, [date,email, password]);
        if (updateResult.affectedRows > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error(error);
        throw error;
    }
}

static async getActiveUsers() {
  const query = 'SELECT * FROM users WHERE is_active = 1';
  try {
      const [result] = await pool.execute(query);
      return result;
  } catch (error) {
      console.error('Error fetching active users:', error);
      throw error;
  }
}

static async TodaysRevenue(userId,date) {
    const query = `SELECT SUM(amount) AS total FROM transactions WHERE userId = ? AND DATE(date) = ? AND transactionType = 'creatorPayment'`;
    try {
        const [result] = await pool.execute(query, [userId,date]);
        return result[0].total || '0';
    } catch (error) {
        console.error(error);
        throw error;
    }
}

static async MonthlyRevenue(userId, date) {
    const [year, month] = date.split('-');
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-31`; 

    const query = `SELECT SUM(amount) AS total FROM transactions WHERE userId = ? AND DATE(date) >= ? AND DATE(date) <= ? AND transactionType = 'creatorPayment'`;

    try {
        const [result] = await pool.execute(query, [userId, startDate, endDate]);
        return result[0].total||'0'; 
    } catch (error) {
        console.error(error);
        throw error;
    }
}


static async lifetimeRevenue(userId) {
    const query = `SELECT SUM(amount) AS total FROM transactions WHERE userId = ? AND transactionType = 'creatorPayment'`;
    try {
        const [result] = await pool.execute(query, [userId]);
        return result[0].total||'0';
    } catch (error) {
        console.error(error);
        throw error;
    }
}


static async getTopicTrendingSocialData(tableName, status, teamId) {
    let query;
    let values;
    if (tableName === 'topics') { 
        query = `SELECT topics.image_path AS topic_image_path, topics.topic, 
                         admin.image AS profile_image_path, admin.name, admin.mobile 
                 FROM topics 
                 INNER JOIN admin ON topics.teamId = admin.id
                 WHERE topics.status = ? AND topics.teamId = ?`;
        values = [status, teamId];
    }
    if (tableName === 'youtubeupdates') { 
        query = `SELECT youtubeupdates.image_path AS social_update_image_path, youtubeupdates.title, 
                         admin.image AS profile_image_path, admin.name, admin.mobile 
                 FROM topics 
                 INNER JOIN admin ON youtubeupdates.teamId = admin.id
                 WHERE youtubeupdates.status = ? AND youtubeupdates.teamId = ?`;
        values = [status, teamId];
    }
    if (tableName === 'trendingtopics') { 
        query = `SELECT trendingtopics.image_path AS trendingtopic_image_path, trendingtopics.title, 
                         admin.image AS profile_image_path, admin.name, admin.mobile 
                 FROM topics 
                 INNER JOIN admin ON trendingtopics.teamId = admin.id
                 WHERE trendingtopics.status = ? AND trendingtopics.teamId = ?`;
        values = [status, teamId];
    }
  try {
      const [results] = await pool.execute(query, values);
      return results;
}catch (error) {
  console.error(error);
  throw error;
}

}

static async getTopicTrendingSocialDataAdmin(tableName, status) {
    let query;
    let values;
    if (tableName === 'topics') { 
        query = `SELECT topics.image_path AS topic_image_path, topics.topic, 
                         admin.image AS profile_image_path, admin.name, admin.mobile 
                 FROM topics 
                 INNER JOIN admin ON topics.teamId = admin.id
                 WHERE topics.status = ? `;
        values = [status];
    }
    if (tableName === 'youtubeupdates') { 
        query = `SELECT youtubeupdates.image_path AS social_update_image_path, youtubeupdates.title, 
                         admin.image AS profile_image_path, admin.name, admin.mobile 
                 FROM youtubeupdates 
                 INNER JOIN admin ON youtubeupdates.teamId = admin.id
                 WHERE youtubeupdates.status = ?`;
        values = [status];
    }
    if (tableName === 'trendingtopics') { 
        query = `SELECT trendingtopics.image_path AS trendingtopic_image_path, trendingtopics.title, 
                         admin.image AS profile_image_path, admin.name, admin.mobile 
                 FROM trendingtopics 
                 INNER JOIN admin ON trendingtopics.teamId = admin.id
                 WHERE trendingtopics.status = ?`;
        values = [status];
    }
  try {
      const [results] = await pool.execute(query, values);
      return results;
}catch (error) {
  console.error(error);
  throw error;
}

}


static async getAllYestardayRegisteredUsers(date) {
    const query = `SELECT * FROM users WHERE DATE(registrationDate) = ?`;
    try {
        const [results] = await pool.execute(query, [date]);
        return results;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

static async paidUsers() {
    const query = `SELECT * FROM users WHERE is_paid = 'YES'`;
    try {
        const [results] = await pool.execute(query);
        return results;
    } catch (error) {
        console.error(error);
        throw error;
    }

}

static async countLiveUsers() {
    const fiveMinutesAgo = moment().tz('Asia/Kolkata').subtract(5, 'minutes').format('DD-MM-YYYY HH:mm:ss');
    const query = `
    SELECT COUNT(*) AS live_users
    FROM users
    WHERE STR_TO_DATE(lastActive, '%d-%m-%Y %h:%i:%s %p') >= STR_TO_DATE(?, '%d-%m-%Y %h:%i:%s %p');
  `;
    const [rows] = await pool.execute(query, [fiveMinutesAgo]);
    return rows[0].live_users;
  }


  static async getAllPendindWithdrawals(yesterdaydate,todaydate) {
    const query = `
        SELECT 
            SUM(CASE WHEN status = '0' THEN amount ELSE 0 END) AS totalPendingAmount,
            SUM(CASE WHEN status = '1' THEN amount ELSE 0 END) AS totalPaidAmount,
            SUM(CASE WHEN status = '1' AND DATE(date) = ? THEN amount ELSE 0 END) AS yesterdaysPaidAmount,
            SUM(CASE WHEN status = '1' AND DATE(date) = ? THEN amount ELSE 0 END) AS todaysPaidAmount
        FROM withdraw_requests;
    `;
    try {
        const [results] = await pool.execute(query, [yesterdaydate,todaydate]);
        return results[0];
    } catch (error) {
        console.error(error);
        throw error;
    }
  
}

static async getAllRevenue(yesterdaydate,todaydate) {
    const query = `
        SELECT 
            SUM(amount) AS totalRevenueData,
            SUM(CASE WHEN DATE(serviceTakenDate) = ? THEN amount ELSE 0 END) AS yesterdaysRevenue,
            SUM(CASE WHEN DATE(serviceTakenDate) = ? THEN amount ELSE 0 END) AS todaysRevenue
        FROM userService;
    `;
    try {
        const [results] = await pool.execute(query, [yesterdaydate,todaydate]);
        return results[0];
    } catch (error) {
        console.error(error);
        throw error;
    }
  
}

static async postCount() {
    const query = `SELECT * FROM topics`;
    const query2 = `SELECT * FROM youtubeupdates`;
    try {
        const [results] = await pool.execute(query);
        const [results2] = await pool.execute(query2);
        return {
            totalPost: results.length,
            totalSocialPost: results2.length
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
}

static async getRevenue(today, date, startDateMonth, endDateMonth, startDateYear, endDateYear) {
    try{
    const query = `
      SELECT 
        SUM(amount) AS totalRevenueData,
        SUM(CASE WHEN STR_TO_DATE(serviceTakenDate, '%Y-%m-%d') = ? THEN amount ELSE 0 END) AS todayRevenue,
        SUM(CASE WHEN STR_TO_DATE(serviceTakenDate, '%Y-%m-%d') = ? THEN amount ELSE 0 END) AS yesterdaysRevenue,
        SUM(CASE WHEN STR_TO_DATE(serviceTakenDate, '%Y-%m-%d') BETWEEN ? AND ? THEN amount ELSE 0 END) AS thisMonthRevenue,
        SUM(CASE WHEN STR_TO_DATE(serviceTakenDate, '%Y-%m-%d') BETWEEN ? AND ? THEN amount ELSE 0 END) AS thisYearRevenue
      FROM userService;
    `;

    const [rows] = await pool.execute(query, [today, date, startDateMonth, endDateMonth, startDateYear, endDateYear]);
    return {
        totalRevenueData: parseInt(rows[0].totalRevenueData,10),
        todayRevenue: parseInt(rows[0].todayRevenue,10),
        yesterdaysRevenue: parseInt(rows[0].yesterdaysRevenue,10),
        thisMonthRevenue: parseInt(rows[0].thisMonthRevenue,10),
        thisYearRevenue: parseInt(rows[0].thisYearRevenue,10)
    };
    }catch (error) {
        console.error(error);
        throw error;
    }
}


static async countLiveUsersYestarday() {
    const fiveMinutesAgo = moment().tz('Asia/Kolkata').subtract(5, 'minutes').subtract(1, 'days').format('DD-MM-YYYY HH:mm:ss');
    const query = `
    SELECT COUNT(*) AS live_users
    FROM users
    WHERE STR_TO_DATE(lastActive, '%d-%m-%Y %h:%i:%s %p') >= STR_TO_DATE(?, '%d-%m-%Y %h:%i:%s %p');
  `;
    const [rows] = await pool.execute(query, [fiveMinutesAgo]);
    return rows[0].live_users;
  }


  static async deleteFromTable(table, id) {
    const query = `DELETE FROM ${table} WHERE id = ?;`;
    try {
      await pool.execute(query, [id]);
      return true;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async deleteAllData(table) {
    try{
    const query = `DELETE FROM ${table}`;
    await pool.execute(query);
    return true;
    }catch (error) {
        console.error(error);
        throw error;
    }
}

static async getMonthlyRevenue(monthlyRanges) {
    let revenues = [];
    for (let range of monthlyRanges) {
      const query = `
        SELECT SUM(amount) AS revenue
        FROM userService
        WHERE STR_TO_DATE(serviceTakenDate, '%Y-%m-%d') BETWEEN ? AND ?;
      `;
      const [rows] = await pool.execute(query, [range.startOfMonth, range.endOfMonth]);
      revenues.push({
        month: range.startOfMonth.substring(0, 7), // Format as YYYY-MM
        revenue: parseInt(rows[0].revenue, 10) || 0
      });
    }
    return revenues;
  }


}
module.exports = Dashboard;