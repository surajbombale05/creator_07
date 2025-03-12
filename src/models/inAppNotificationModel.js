const pool = require("../../db");

class InAppNotification {
  constructor({ id, title, message, userIds, action, notification_type, playstore_url, ios_url, android_min_version, android_curr_version, ios_min_version, ios_curr_version, createdAt, updatedAt, workId, image, url, type, notificationType, notificationSentTo, openBy, notOpen, scheduled, scheduledDate, messageId, date }) {
    this.id = id;
    this.title = title;
    this.message = message;
    this.userIds = userIds;
    this.action = action;
    this.notification_type = notification_type;
    this.playstore_url = playstore_url;
    this.ios_url = ios_url;
    this.android_min_version = android_min_version;
    this.android_curr_version = android_curr_version;
    this.ios_min_version = ios_min_version;
    this.ios_curr_version = ios_curr_version;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.workId = workId;
    this.image = image;
    this.url = url;
    this.type = type;
    this.notificationType = notificationType;
    this.notificationSentTo = notificationSentTo;
    this.openBy = openBy;
    this.notOpen = notOpen;
    this.scheduled = scheduled;
    this.scheduledDate = scheduledDate;
    this.messageId = messageId;
    this.date = date;
  }

  static async create({ title, message, userIds, action, notification_type, playstore_url, ios_url, android_min_version, android_curr_version, ios_min_version, ios_curr_version, workId, image, url, date, notOpen }) {
    const createdAt = new Date();
    const updatedAt = createdAt;
    const query =
      "INSERT INTO in_app_notifications (title, message, userIds, action, notification_type, playstore_url, ios_url, android_min_version, android_curr_version, ios_min_version, ios_curr_version, createdAt, updatedAt, workId, image, url, date, notOpen) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    try {
      const [result] = await pool.execute(query, [
        title,
        message,
        JSON.stringify(userIds),
        action,
        notification_type,
        playstore_url||null,
        ios_url||null,
        android_min_version||null,
        android_curr_version||null,
        ios_min_version||null,
        ios_curr_version||null,
        createdAt,
        updatedAt,
        workId||null,
        image||null,
        url||null,
        date,
        notOpen
      ]);

      if (result.affectedRows !== 1) {
        throw new Error("In-app notification creation failed");
      }

      const newNotification = new InAppNotification({
        id: result.insertId,
        title,
        message,
        userIds,
        action,
        notification_type,
        playstore_url,
        ios_url,
        android_min_version,
        android_curr_version,
        ios_min_version,
        ios_curr_version,
        workId,
        image,
        url,
        createdAt,
        updatedAt,
        date
      });

      return newNotification;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findNotificationById(notificationId) {
    const query = "SELECT * FROM in_app_notifications WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [notificationId]);
      return results.length ? results[0] : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAllNotifications() {
    const query = `
    SELECT *
    FROM in_app_notifications
    WHERE notification_type != 'review'
  `;

    try {
      const [result] = await pool.execute(query);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async deleteNotification(notificationId) {
    const query = "DELETE FROM in_app_notifications WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [notificationId]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async deleteUserIdFromNotification(notificationId, userIdToDelete) {
    const selectQuery = "SELECT userIds FROM in_app_notifications WHERE id = ?";
    const updateQuery = "UPDATE in_app_notifications SET userIds = ? WHERE id = ?";

    try {
        const [rows] = await pool.execute(selectQuery, [notificationId]);
        if (rows.length === 0) {
            throw new Error('Notification not found');
        }
        let userIds = JSON.parse(rows[0].userIds);
        userIds = userIds.filter(userId => userId !== userIdToDelete);
        const [results] = await pool.execute(updateQuery, [JSON.stringify(userIds), notificationId]);
        return results.affectedRows > 0;
    } catch (error) {
        console.error(error);
        throw error;
    }
  }

  static async updateNotificationNew(notificationId, updateFields) {
    updateFields.updatedAt = new Date();
    const keys = Object.keys(updateFields);
    const values = Object.values(updateFields);

    if (keys.length === 0) {
        return false;
    }

    const setClause = keys.map(key => `${key} = ?`).join(", ");
    const query = `
      UPDATE in_app_notifications
      SET ${setClause}
      WHERE id = ?;
    `;

    try {
        values.push(notificationId);
        const [results] = await pool.execute(query, values);
        return results.affectedRows > 0;
    } catch (error) {
        console.error(error);
        throw error;
    }
  }

  static async updateNotification(notificationId, {
    title,
    message,
    userIds,
    action,
    notification_type,
    playstore_url,
    ios_url,
    android_min_version,
    android_curr_version,
    ios_min_version,
    ios_curr_version
  }) {
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined) {
      updateFields.push("title = ?");
      updateValues.push(title);
    }
    if (message !== undefined) {
      updateFields.push("message = ?");
      updateValues.push(message);
    }
    if (userIds !== undefined) {
      updateFields.push("userIds = ?");
      updateValues.push(JSON.stringify(userIds));
    }
    if (action !== undefined) {
      updateFields.push("action = ?");
      updateValues.push(action);
    }
    if (notification_type !== undefined) {
      updateFields.push("notification_type = ?");
      updateValues.push(notification_type);
    }
    if (playstore_url !== undefined) {
      updateFields.push("playstore_url = ?");
      updateValues.push(playstore_url);
    }
    if (ios_url !== undefined) {
      updateFields.push("ios_url = ?");
      updateValues.push(ios_url);
    }
    if (android_min_version !== undefined) {
      updateFields.push("android_min_version = ?");
      updateValues.push(android_min_version);
    }
    if (android_curr_version !== undefined) {
      updateFields.push("android_curr_version = ?");
      updateValues.push(android_curr_version);
    }
    if (ios_min_version !== undefined) {
      updateFields.push("ios_min_version = ?");
      updateValues.push(ios_min_version);
    }
    if (ios_curr_version !== undefined) {
      updateFields.push("ios_curr_version = ?");
      updateValues.push(ios_curr_version);
    }
    

    updateFields.push("updatedAt = CURRENT_TIMESTAMP");

    if (updateFields.length === 0) {
      return false; // No fields to update
    }

    const query = `
      UPDATE in_app_notifications
      SET ${updateFields.join(", ")}
      WHERE id = ?;
    `;
    try {
      const params = [...updateValues, notificationId];
      const [results] = await pool.execute(query, params);
      return results.affectedRows > 0 ? true : false;
    } catch (error) {
      console.error(error);
      throw error;
    }
}

static async updateReviewInAppNotification(notificationId) {
    const query = `
      UPDATE in_app_notifications
      SET action = 'off'
      WHERE workId = ? AND notification_type = 'review' AND action = 'on';
    `;
    try {
      const [results] = await pool.execute(query, [notificationId]);
      return results.affectedRows > 0 ? true : false;
    } catch (error) {
      console.error(error);
      throw error;
    }
}


static async findAllReviewNotifications(userIds) {
  const query =`
  SELECT i.id, i.title, i.message, i.userIds, i.action, i.workId, r.description, u.profile_image, CONCAT(u.firstName, ' ', u.lastName) AS name
  FROM in_app_notifications i
  INNER JOIN requests r ON i.workId = r.id
  INNER JOIN users u ON r.creatorId = u.id
  WHERE i.userIds = ? 
  AND i.notification_type = 'review' 
  AND i.action = 'on'
`;

  try {
    const [results] = await pool.execute(query, [userIds]);
    return results;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


static async createFcmNotification({ title, message, userIds, action, notification_type, playstore_url, ios_url, android_min_version, android_curr_version, ios_min_version, ios_curr_version, workId, image, url, type, notificationType, notificationSentTo, scheduled, scheduledDate, messageId, notOpen, date }) {
  const createdAt = new Date();
  const updatedAt = createdAt;
  const query =`INSERT INTO in_app_notifications 
  (title, message, userIds, action, notification_type, playstore_url, ios_url, android_min_version, 
   android_curr_version, ios_min_version, ios_curr_version, createdAt, updatedAt, workId, image, 
   url, type, notificationType, notificationSentTo, scheduled, scheduledDate, messageId, notOpen, date) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `
  try {
    const [result] = await pool.execute(query, [
      title,
      message,
      JSON.stringify(userIds),
      action,
      notification_type,
      playstore_url||null,
      ios_url||null,
      android_min_version||null,
      android_curr_version||null,
      ios_min_version||null,
      ios_curr_version||null,
      createdAt,
      updatedAt,
      workId||null,
      image||null,
      url||null,
      type||null,
      notificationType||null,
      notificationSentTo||null,
      scheduled||null,
      scheduledDate||null,
      messageId||null,
      notOpen,
      date
    ]);

    if (result.affectedRows !== 1) {
      throw new Error("In-app notification creation failed");
    }

    const newNotification = new InAppNotification({
      id: result.insertId,
      title,
      message,
      userIds,
      action,
      notification_type,
      playstore_url,
      ios_url,
      android_min_version,
      android_curr_version,
      ios_min_version,
      ios_curr_version,
      workId,
      image,
      url,
      createdAt,
      updatedAt,
      type,
      notificationType,
      notificationSentTo,
      scheduled,
      scheduledDate,
      messageId
    });

    return newNotification;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

static async getdashboardData() {
  const query = `
        SELECT 
          COUNT(*) AS total_rows,
          SUM(CASE WHEN notificationType = 'popup' THEN 1 ELSE 0 END) AS total_popup,
          SUM(CASE WHEN notificationType = 'event' THEN 1 ELSE 0 END) AS total_event,
          SUM(CASE WHEN notificationType = 'schedule' THEN 1 ELSE 0 END) AS total_schedule
      FROM 
          in_app_notifications;
      `;
  try {
    const [result] = await pool.execute(query);
    return result.length ? result[0] : null;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
static async findNewCreatedEventNotifcation() {
  const query = `SELECT * FROM in_app_notifications WHERE notificationType = 'event' AND notificationSentTo = 'Individual' ORDER BY id DESC LIMIT 1`;
  try {
    const [result] = await pool.execute(query);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

static async updateNotificationMessageId(notificationId, messageId) {
  const query = `UPDATE in_app_notifications SET messageId = ? WHERE id = ?`;
  try {
    const [result] = await pool.execute(query, [messageId.toString(), notificationId]);
    return result.affectedRows > 0 ? true : false;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

static async updateNotificationCount(notificationId) {
  const query = `UPDATE in_app_notifications SET openBy = openBy + 1,
    notOpen = notOpen - 1 WHERE messageId = ?`;
  try{
    const [result] = await pool.execute(query, [notificationId]);
    return result.affectedRows > 0 ? true : false;
  }catch(error){
    console.error(error);
    throw error;
}
}


static async findAllNotificationWithType(notificationType = null) {
  let query = `
    SELECT * FROM in_app_notifications
    WHERE notification_type IN ('notification', 'update')
  `;
  
  const queryParams = [];

  if (notificationType !== null) {
    query += ' AND notificationType = ?';
    queryParams.push(notificationType);
  }

  query += ' ORDER BY id DESC;';

  try {
    const [result] = await pool.execute(query, queryParams);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
}


static async countNotification(){
  const query = `SELECT 
  COUNT(*) as totalNotifications,
  SUM(CASE WHEN notificationType = 'schedule' THEN 1 ELSE 0 END) as scheduled_count,
  SUM(CASE WHEN notificationType = 'event' THEN 1 ELSE 0 END) as event_count,
  SUM(CASE WHEN notificationType = 'popup' THEN 1 ELSE 0 END) as popup_count
FROM in_app_notifications;
`;
  try{
    const [result] = await pool.execute(query);
    return {
      totalNotifications: parseInt(result[0].totalNotifications||0),
      scheduled_count: parseInt(result[0].scheduled_count||0),
      event_count: parseInt(result[0].event_count||0),
      popup_count: parseInt(result[0].popup_count||0)
    };
  }catch(error){
    console.error(error);
    throw error;
  }

}

static async updateNotOpen(notificationId, notOpen) {
  const query = `UPDATE in_app_notifications SET notOpen = ? WHERE id = ?`;
  try {
    const [result] = await pool.execute(query, [notOpen, notificationId]);
    return result.affectedRows > 0 ? true : false;
  } catch (error) {
    console.error(error);
    throw error;
  }

}


}
module.exports = InAppNotification;
