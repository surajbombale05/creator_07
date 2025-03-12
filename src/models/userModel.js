const pool = require("../../db");

class User {
  constructor({
    firstName,
    lastName,
    email,
    password,
    mobile,
    fullname,
    about,
    profile_image,
    work_image,
    work_vedio,
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
    totalRevenue,
    yesterdayRevenue,
    thisMonthRevenue,
    lifeTimeRevenue,
    completeWork,
    pendingWork,
    myWork,
    views,
    device_token,
    registrationDate,
    amount,
    showBanner,
    apiToken,
    is_paid,
    teamMemberAssigned,
    country,
    verified,
    verficationLink,
    selectedCreator
  }) {
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.password = password;
    this.mobile = mobile;
    this.fullname = fullname;
    this.about = about;
    this.profile_image = profile_image;
    this.work_image = work_image;
    this.work_vedio = work_vedio;
    this.language = language;
    this.state = state;
    this.city = city;
    this.timeline = timeline;
    this.responseTime = responseTime;
    this.instagramUrl = instagramUrl;
    this.twitterUrl = twitterUrl;
    this.youtubeUrl = youtubeUrl;
    this.facebookUrl = facebookUrl;
    this.price = price;
    this.amountType = amountType;
    this.star = star;
    this.edited = edited;
    this.thumbnail = thumbnail;
    this.totalRevenue = totalRevenue;
    this.yesterdayRevenue = yesterdayRevenue;
    this.thisMonthRevenue = thisMonthRevenue;
    this.lifeTimeRevenue = lifeTimeRevenue;
    this.completeWork = completeWork;
    this.pendingWork = pendingWork;
    this.myWork = myWork;
    this.views = views;
    this.device_token = device_token;
    this.registrationDate = registrationDate;
    this.amount = amount;
    this.showBanner = showBanner;
    this.apiToken = apiToken;
    this.is_paid = is_paid;
    this.teamMemberAssigned = teamMemberAssigned;
    this.country = country;
    this.verified = verified;
    this.verficationLink = verficationLink;
    this.selectedCreator = selectedCreator;
  }

  static async create({ firstName, lastName, email, password, mobile, device_token, registrationDate}) {
    const query =
      "INSERT INTO users (firstName, lastName, email, password, mobile, is_active, device_token, createdAt, updatedAt, registrationDate) VALUES (?, ?, ?, ?, ?, false, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)";
    const values = [firstName, lastName, email, password, mobile, device_token||null, registrationDate];
    try {
      const [result] = await pool.execute(query, values);
      const parsedResult = {
        id: result.id,
        firstName: result.firstName,
        lastName: result.lastName,
        email: result.email,
        password: result.password,
        mobile: result.mobile,
        name: null,
        description: null,
        profile_image: null,
        work_image: null,
        work_vedio: null,
        language: null,
        state: null,
        price: null,
        star: null,
        edited: null,
        thumbnail: null,
        is_active: Boolean(result.is_active),
        totalRevenue: 0,
        yesterdayRevenue: 0,
        thisMonthRevenue: 0,
        lifeTimeRevenue: 0,
        completeWork: 0,
        pendingWork: 0,
        myWork: 0,
        views: 0,
        device_token: result.device_token,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        registrationDate: result.registrationDate,
      };
      return parsedResult;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findOneByEmail(email) {
    const query = "SELECT * FROM users WHERE email = ?";

    try {
      const [result] = await pool.execute(query, [email]);
      return result.length ? result[0] : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findOneByMobile(mobile) {
    const query = "SELECT * FROM users WHERE mobile = ?";

    try {
      const [result] = await pool.execute(query, [mobile]);
      return result.length ? result[0] : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAllUsersCreatorIsTrue(page) {
    const limit = 10;
    const offset = (page - 1) * limit;
    const countQuery = "SELECT COUNT(*) as total FROM users WHERE is_creator = 1";
    const dataQuery = "SELECT * FROM users ORDER BY selectedCreator DESC, star DESC LIMIT ? OFFSET ?";

    try {
        const [countResult] = await pool.execute(countQuery);
        const totalRecords = countResult[0].total;        
        const totalPages = Math.ceil(totalRecords / limit);
        const [dataResult] = await pool.execute(dataQuery, [limit, offset]); 
        return {
            totalPages: totalPages,
            currentPage: page,
            data: dataResult
        };
    } catch (error) {
        console.error(error);
        throw error;
    }
}


  static async checkCredentials(email, password) {
    const query = "SELECT * FROM users WHERE email = ? AND password = ?";

    try {
      const [result] = await pool.execute(query, [email, password]);
      return result.length ? result[0] : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async getTokensbyIds(ids) {
    const query = `SELECT device_token FROM users WHERE id IN (${ids.map(() => '?').join(',')})`;

    try {
        const [results] = await pool.execute(query, ids);
        if (results.length) {
            const deviceTokens = results.map(row => row.device_token);
            return deviceTokens;
        }
        return null;
    } catch (error) {
        console.error(error);
        throw error;
    }
  }

  static async findUserById(userId) {
    const query = "SELECT * FROM users WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [userId]);
      return results.length ? results[0] : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateUser(
    userId,
    { firstName, lastName, email, password, mobile }
  ) {
    const updateFields = [];
    const updateValues = [];
    console.log(`***********${userId}`);
    const pushField = (field, value) => {
      if (value !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(value);
      }
    };
  
    pushField("firstName", firstName);
    pushField("lastName", lastName);
    pushField("email", email);
    pushField("password", password);
    pushField("mobile", mobile);
  
    if (updateFields.length === 0) {
      return false;
    }
  
    const query = `
      UPDATE users
      SET ${updateFields.join(", ")}
      WHERE id = ?;
    `;
  
    updateValues.push(userId); // Ensure userId is always at the end
  
    try {
      const [results] = await pool.execute(query, updateValues);
      return results.affectedRows > 0 ? true : false;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  

  static async deleteUser(userId) {
    const query = "DELETE FROM users WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [userId]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateActiveStatusForPreviousDay() {
    const updateQuery = "UPDATE users SET is_active = 0 WHERE is_active = 1";
    try {
      const [updateResult] = await pool.execute(updateQuery);
      return updateResult;
    } catch (error) {
      console.error("Error updating users:", error);
      throw error;
    }
  }

  static async updateUserProfile(
    userId,
    {
      firstName,
      lastName,
      email,
      password,
      mobile,
      fullname,
      about,
      profile_image,
      work_image,
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
    }
  ) {
    const updateFields = [];
    if(firstName !== undefined) {
      updateFields.push("firstName = ?");
    }
    if(lastName !== undefined) {
      updateFields.push("lastName = ?");
    }
    if(email !== undefined) {
      updateFields.push("email = ?");
    }
    if(password !== undefined) {
      updateFields.push("password = ?");
    }
    if(mobile !== undefined) {
      updateFields.push("mobile = ?");
    }
    if (fullname !== undefined) {
      updateFields.push("fullname = ?");
    }
    if (about !== undefined) {
      updateFields.push("about = ?");
    }
    if (profile_image !== undefined) {
      updateFields.push("profile_image = ?");
    }
    if (work_image !== undefined) {
      updateFields.push("work_image = ?");
    }
    if (work_video !== undefined) {
      updateFields.push("work_video = ?");
    }
    if (language !== undefined) {
      updateFields.push("language = ?");
    }
    if (price !== undefined) {
      updateFields.push("price = ?");
    }
    if (amountType !== undefined) {
      updateFields.push("amountType = ?");
    }
    if (star !== undefined) {
      updateFields.push("star = ?");
    }
    if (state !== undefined) {
      updateFields.push("state = ?");
    }
    if (city !== undefined) {
      updateFields.push("city = ?");
    }
    if (timeline !== undefined) {
      updateFields.push("timeline = ?");
    }
    if (responseTime !== undefined) {
      updateFields.push("responseTime = ?");
    }
    if (instagramUrl !== undefined) {
      updateFields.push("instagramUrl = ?");
    }
    if (twitterUrl !== undefined) {
      updateFields.push("twitterUrl = ?");
    }
    if (youtubeUrl !== undefined) {
      updateFields.push("youtubeUrl = ?");
    }
    if (facebookUrl !== undefined) {
      updateFields.push("facebookUrl = ?");
    }
    if (edited !== undefined) {
      updateFields.push("edited = ?");
    }
    if (thumbnail !== undefined) {
      updateFields.push("thumbnail = ?");
    }
    if (country !== undefined) {
      updateFields.push("country = ?");
    }
    if (updateFields.length === 0) {
      return false;
    }

    const query = `
    UPDATE users
    SET ${updateFields.join(", ")}
    WHERE id = ?;
  `;

    const params = [
      firstName,
      lastName,
      email,
      password,
      mobile, 
      fullname,
      about,
      profile_image,
      work_image,
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
      country,
      userId,
    ].filter((value) => value !== undefined);
    try {
      const [results] = await pool.execute(query, params);
      return results.affectedRows > 0 ? true : false;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findDashBoardById(userId) {
    const query = "SELECT totalRevenue, yesterdayRevenue, thisMonthRevenue, lifeTimeRevenue, completeWork, pendingWork, myWork, views FROM users WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [userId]);
      return results.length ? new User(results[0]) : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateIsCreator(userId, newIsCreatorValue) {
    const query = "UPDATE users SET is_creator = ? WHERE id = ?";

    try {
      const [result] = await pool.execute(query, [newIsCreatorValue, userId]);
      return result.affectedRows > 0 ? true : false;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findCreatorById(userId) {
    const query = "SELECT * FROM users WHERE id = ? AND is_creator = 1";

    try {
      const [results] = await pool.execute(query, [userId]);
      return results.length ? results[0] : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateDeviceToken(email, device_token) {
    const updateQuery = "UPDATE users SET device_token = ? WHERE email = ?";
    try {
      const [result] = await pool.execute(updateQuery, [device_token, email]);
      if (result.affectedRows === 1) {
        return true;
      }
      return false; 
    } catch (error) {
      console.error("Error updating device token:", error);
      throw error;
    }
  }

  static async findAllUsers(serchType, todayDate, targetDate, searchName) {
    let query;
    let value = [];

    if (serchType === 'all') {
        query = "SELECT * FROM users";
    } else if (serchType === 'topTen') {
      query = "SELECT * FROM users WHERE selectedCreator = 1";
      value.push(targetDate);
    } else if (serchType === 'Yesterday') {
        query = "SELECT * FROM users WHERE DATE(registrationDate) = ?";
        value.push(targetDate);
    } else {
        query = "SELECT * FROM users WHERE DATE(registrationDate) BETWEEN ? AND ?";
        value.push(targetDate, todayDate);
    }
    if (searchName) {
        if (value.length > 0) {
            query += " AND CONCAT(firstname, ' ', lastname) LIKE ?";
        } else {
            query += " WHERE CONCAT(firstname, ' ', lastname) LIKE ?";
        }
        value.push(`%${searchName}%`);
    }

    query += " ORDER BY id DESC;";
    try {
        const [result] = await pool.execute(query, value);
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


  static async findAllUsersByCreationDate(startDate) {
    const query = "SELECT * FROM users WHERE createdAt >= ?";
    
    try {
        const [result] = await pool.execute(query, [startDate]);
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

static async findCreatorsByCreationDate(startDate) {
    const query = "SELECT * FROM users WHERE is_creator = 1 AND createdAt >= ?";
    
    try {
        const [result] = await pool.execute(query, [startDate]);
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

static async findRegularUsersByCreationDate(startDate) {
    const query = "SELECT * FROM users WHERE is_creator = 0 AND createdAt >= ?";
    
    try {
        const [result] = await pool.execute(query, [startDate]);
        return result;
    } catch (error) {
        console.error(error);
        throw error;
    }
}

static async getUsersByFilterAndTime(filterBy, timeRange) {
  try {
    let query;
    let values = [];

    switch (timeRange) {
      case 'last_24_days':
        query = `SELECT * FROM users WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 24 DAY)`;
        break;
      case 'last_10_days':
        query = `SELECT * FROM users WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 10 DAY)`;
        break;
      case 'last_5_days':
        query = `SELECT * FROM users WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 5 DAY)`;
        break;
      case 'yesterday':
        query = `SELECT * FROM users WHERE DATE(createdAt) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;
        break;
      case 'today':
        query = `SELECT * FROM users WHERE DATE(createdAt) = CURDATE()`;
        break;
      case 'last_2_hour':
        query = `SELECT * FROM users WHERE DATE_ADD(createdAt, INTERVAL '5:30' HOUR_MINUTE) >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2 HOUR)`;
        break;
      case 'last_1_hour':
        query = `SELECT * FROM users WHERE DATE_ADD(createdAt, INTERVAL '5:30' HOUR_MINUTE) >= DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 HOUR)`;
        break;
      default:
        throw new Error('Invalid date range');
    }

    if (filterBy === 'creator') {
      query += ` AND is_creator = 1`;
    } else if (filterBy === 'user') {
      query += ` AND is_creator = 0`;
    } else if (filterBy !== 'all') {
      throw new Error('Invalid user type');
    }

    const [rows] = await pool.query(query, values);
    return rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

static async updateIsCollaborator(userId, newIsCollboratorValue) {
  const query = "UPDATE users SET is_collaborator = ? WHERE id = ?";

  try {
    const [result] = await pool.execute(query, [newIsCollboratorValue, userId]);
    return result.affectedRows > 0 ? true : false;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

static async updateCollaboratorDetails(userId, channelName, subscribers, channelImage, categoryName, categoryId ) {
  const query = "UPDATE users SET  channelName = ?, subscribers = ?, channel_image = ?, categoryName = ?, categoryId = ? WHERE id = ?";

  try {
    const [result] = await pool.execute(query, [channelName, subscribers, channelImage, categoryName, categoryId, userId]);
    return result.affectedRows > 0 ? true : false;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

static async findAllUsersCollaboratorIsTrue(page=1) {
  const limit = 10;
  const offset = (page - 1) * limit;
  const countQuery = "SELECT COUNT(*) as total FROM users WHERE is_collaborator = 1";
  const dataQuery = "SELECT * FROM users ORDER BY selectedCreator DESC, star DESC LIMIT ? OFFSET ?";

  try {
      const [countResult] = await pool.execute(countQuery);
      const totalRecords = countResult[0].total;        
      const totalPages = Math.ceil(totalRecords / limit);
      const [dataResult] = await pool.execute(dataQuery, [limit, offset]); 
      return {
          totalPages: totalPages,
          currentPage: page,
          data: dataResult
      };
  } catch (error) {
      console.error(error);
      throw error;
  }
}

// static async findAllUsersCollaboratorIsTrue() {
//   const query = "SELECT * FROM users WHERE is_collaborator = 1";
//   try {
//     const [result] = await pool.execute(query);
//     return result;
//   } catch (error) {
//     console.error(error);
//     throw error;
//   }
// }

static async findCollaboratorById(userId) {
  const query = "SELECT * FROM users WHERE id = ? AND is_collaborator = 1";

    try {
      const [results] = await pool.execute(query, [userId]);
      return results.length ? results[0] : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
}


static async updateStatus(id, status) {
  const query = "UPDATE users SET userStatus = ? WHERE id = ?";
  try {
    const [result] = await pool.execute(query, [status, id]);
    return result.affectedRows > 0 ? true : false;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


static async checkDeviceTokenStatus(deviceToken) {
  const query = "SELECT * FROM users WHERE device_token = ? AND userStatus = 1";
  try {
    const [result] = await pool.execute(query, [deviceToken]);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }

}


static async updateShowBanner(id, showBanner) {
  const query = "UPDATE users SET showBanner = ? WHERE id = ?";
  try {
    const [result] = await pool.execute(query, [showBanner, id]);
    return result.affectedRows > 0 ? true : false;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

static async addAmount(userId, amount) {
  const user = await this.findUserById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  const newBalance = user.balance + amount;
  const query = "UPDATE users SET balance = ? WHERE id = ?";
  const values = [newBalance, userId];
  console.log(query, values);
  try {
    const [result] = await pool.execute(query, values);
    if (result.affectedRows !== 1) {
      throw new Error("Failed to update user balance");
    }
    return true;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


static async addPendingStatus(id) {
const query = "UPDATE users SET pendingWork = pendingWork + 1 WHERE id = ?";
try {
  const [result] = await pool.execute(query, [id]);
  return result.affectedRows > 0 ? true : false;
} catch (error) {
  console.error(error);
  throw error;
}
}

static async substarctPendingStatus(id) {
  const query = "UPDATE users SET pendingWork = pendingWork - 1 WHERE id = ?";
  try {
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0 ? true : false;
  } catch (error) {
    console.error(error);
    throw error;
  }
  }

static async updateCompleteStatus(id) {
  const query = "UPDATE users SET completeWork = completeWork + 1 WHERE id = ?";
  try {
    const [result] = await pool.execute(query, [id]);
    return result.affectedRows > 0 ? true : false;
  } catch (error) {
    console.error(error);
    throw error;
  }
  }

  static async addViewsOfUser(id) {
    const query = "UPDATE users SET views = views + 1 WHERE id = ?";
    try {
      const [result] = await pool.execute(query, [id]);
      return result.affectedRows > 0 ? true : false;
    } catch (error) {
      console.error(error);
      throw error;
    }
    }


    static async updateApiToken(id, apiToken) {
      const query = "UPDATE users SET apiToken = ? WHERE id = ?";
      try {
        const [result] = await pool.execute(query, [apiToken, id]);
        return result.affectedRows > 0 ? true : false;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }

    static async updateUserIsPaid(id, isPaid) {
      const query = "UPDATE users SET is_paid = ? WHERE id = ?";
      try {
        const [result] = await pool.execute(query, [isPaid, id]);
        return result.affectedRows > 0 ? true : false;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }

    static async updateTeamId(id, teamId) {
      const query = "UPDATE users SET teamMemberAssigned = ? WHERE id = ?";
      try {
        const [result] = await pool.execute(query, [teamId, id]);
        return result.affectedRows > 0 ? true : false;
      } catch (error) {
        console.error(error);
        throw error;
      }
}

static async updateCreatorStars (id, stars) {
  const query = "UPDATE users SET star = ? WHERE id = ?";
  try {
    const [result] = await pool.execute(query, [stars, id]);
    return result.affectedRows > 0 ? true : false;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


static async getUsersActiveOnDate(todayDate, targetDate) {
  console.log(todayDate, targetDate);
  const query = `
  SELECT id, device_token
  FROM users
  WHERE DATE(registrationDate) BETWEEN DATE(?) AND DATE(?)
  `;
  try {
    const [result] = await pool.execute(query, [targetDate, todayDate]);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


static async findAllWeekCreatorWithTodayCreators(todayDate, targetDate) {
  const query = `
      SELECT 
        (SELECT COUNT(*) FROM users WHERE is_creator = 1 AND DATE(registrationDate) = DATE(?)) AS today_count,
        (SELECT COUNT(*) FROM users WHERE is_creator = 1 AND DATE(registrationDate) BETWEEN DATE(?) AND DATE(?)) AS week_count;
    `;

  try {
    const [result] = await pool.execute(query,[todayDate, targetDate, todayDate]);
    return result[0];
  } catch (error) {
    console.error(error);
    throw error;
  }

}


static async updateVerification(id,verficationLink) {
  const query = "UPDATE users SET verificationLink = ? WHERE id = ?";
  try {
    const [result] = await pool.execute(query, [verficationLink, id]);
    return result.affectedRows > 0 ? true : false;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


static async updateVerfication(id,verification){
  const query = "UPDATE users SET verified = ? WHERE id = ?";
  try {
    const [result] = await pool.execute(query, [verification, id]);
    return result.affectedRows > 0 ? true : false;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

static async updateSelectCreator(id, isCreator) {
  const query = "UPDATE users SET selectedCreator = ? WHERE id = ?";
  try {
    const [result] = await pool.execute(query, [isCreator, id]);
    return result.affectedRows > 0 ? true : false;
  } catch (error) {
    console.error(error);
    throw error;
  }

}



}
module.exports = User;
