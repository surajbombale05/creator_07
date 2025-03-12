const pool = require("../../db");

class Notification {
  constructor({
    id,
    userId,
    requestId,
    actions,
    creatorImagePath,
    message,
    amount,
    mobileNo,
    notificationType,
    action_status,
    date,
    createdAt,
  }) {
    this.id = id;
    this.userId = userId;
    this.requestId = requestId;
    this.actions = actions;
    this.creatorImagePath = creatorImagePath;
    this.message = message;
    this.amount = amount;
    this.mobileNo = mobileNo;
    this.notificationType = notificationType;
    this.action_status = action_status;
    this.createdAt = createdAt;
    this.date = date;
  }

  static async create({ userId, requestId, actions, creatorImagePath, message, notificationType, action_status,amount, date, mobile }) {
    const query =
      "INSERT INTO notifications (user_id, request_id, actions, creator_image_path, notificationType, message, amount, action_status, date, mobile_no) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    const values = [userId, requestId, actions, creatorImagePath, notificationType, message, amount, action_status, date, mobile];
    try {
      const [result] = await pool.execute(query, values);

      if (result.affectedRows !== 1) {
        throw new Error("Notification creation failed");
      }

      const newNotification = new Notification({
        id: result.insertId,
        userId: userId,
        requestId,
        actions,
        notificationType,
        creatorImagePath: creatorImagePath,
        message,
        action_status,
        amount: amount,
        mobileNo: mobile,
        date,
        createdAt: new Date(),
        deletedAt: null,
      });

      return newNotification;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findNotificationById(notificationId) {
    const query = "SELECT * FROM notifications WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [notificationId]);
      return results.length ? new Notification(results[0]) : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAllNotificationsWithUserId(userId) {
    const query = "SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC";
    try {
        const [results] = await pool.execute(query, [userId]);
        return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async deleteNotification(notificationId) {
    const query = "DELETE FROM notifications WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [notificationId]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async createHireNotification({userId, requestId, actions, message, notificationType, mobile, amount, date, creatorImagePath }) {
    const query =
      "INSERT INTO notifications (user_id, request_id, actions, creator_image_path, message, notificationType, amount, mobile_no, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    const values = [userId, requestId, actions, creatorImagePath, message, notificationType, amount, mobile, date];
    try {
      const [result] = await pool.execute(query, values);

      if (result.affectedRows !== 1) {
        throw new Error("Notification creation failed");
      }

      const newNotification = new Notification({
        id: result.insertId,
        userId: userId,
        requestId,
        actions,
        amount,
        notificationType,
        action_status: null,
        mobileNo: mobile,
        creatorImagePath: creatorImagePath,
        message,
        date,
        createdAt: new Date(),
      });

      return newNotification;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async createHireCollaboratorNotification({userId, requestId, creatorImagePath, actions, message, notificationType, mobile, date }) {
    const query =
      "INSERT INTO notifications (user_id, request_id, actions, creator_image_path, message, notificationType, mobile_no, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    const values = [userId, requestId, actions, creatorImagePath, message, notificationType, mobile, date];
    try {
      const [result] = await pool.execute(query, values);

      if (result.affectedRows !== 1) {
        throw new Error("Notification creation failed");
      }

      const newNotification = new Notification({
        id: result.insertId,
        userId: userId,
        requestId,
        actions,
        notificationType,
        creatorImagePath: creatorImagePath,
        message,
        amount:null,
        action_status: null,
        mobileNo: mobile,
        date,
        createdAt: new Date(),
      });

      return newNotification;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  static async createCollaboratorNotification({userId, requestId, actions, creatorImagePath, message, mobile, notificationType, action_status, date }) {
    const query =
      "INSERT INTO notifications (user_id, request_id, actions, creator_image_path, message, mobile_no, notificationType, action_status, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    const values = [userId, requestId, actions, creatorImagePath, message, mobile, notificationType, action_status, date];
    console.log(values);
    try {
      const [result] = await pool.execute(query, values);

      if (result.affectedRows !== 1) {
        throw new Error("Notification creation failed");
      }

      const newNotification = new Notification({
        id: result.insertId,
        userId: userId,
        requestId,
        actions,
        creatorImagePath: creatorImagePath,
        message,
        notificationType,
        action_status: action_status,
        mobileNo: mobile,
        date,
        createdAt: new Date(),
        deletedAt: null,
      });

      return newNotification;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateNotificationActionStatus(requestId,status) {
    console.log(requestId, status);
    try {
      const query = "UPDATE notifications SET action_status = ? WHERE request_id = ? AND actions = 'Hire'";
      const values = [status, requestId];
      const [result] = await pool.execute(query, values);
  
      if (result.affectedRows !== 1) {
        throw new Error("Notification update failed");
      }
  
      return { success: true, message: "Notification action status updated successfully" };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  static async findPayNowNotificationByRequestId(requestId){
    const query = "SELECT * FROM notifications WHERE request_id = ? AND notificationType = 'user' AND actions = 'PayNow'";
    try{
      const [results] = await pool.execute(query, [requestId]);
      return results.length ? new Notification(results[0]) : null;
    }catch(error){
      console.error(error);
      throw error;
    }
  }


  static async updateActionSttaus(requestId, status){
    const query = "UPDATE notifications SET action_status = ? WHERE request_id = ? AND actions = 'PayNow'";
    try{
      const [results] = await pool.execute(query, [status, requestId]);
      return results.affectedRows > 0;
    }catch(error){
      console.error(error);
      throw error;
    }
  }

  static async updateCollaboratorNotificationStatus(requestId, status) {
    const query = "UPDATE notifications SET action_status = ? WHERE request_id = ? AND  notificationType = 'collaborator' AND actions = 'Hire'";
    try {
      const [results] = await pool.execute(query, [status, requestId]);
      if (results.affectedRows !== 1) {
        throw new Error("Notification update failed");
      }
      return { success: true, message: "Notification status updated successfully" };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
}

module.exports = Notification;
