const pool = require("../../db");

class Request {
  constructor({ id, userId, creatorId, language, description, amount, isThumbnail, isEdited, image_path, name, status, date, acceptDate, acceptTime, workStatus, workStartDate, workCompleteDate, location }) {
    this.id = id;
    this.userId = userId;
    this.creatorId = creatorId;
    this.description = description;
    this.amount = amount;
    this.language = language;
    this.isThumbnail = isThumbnail;
    this.isEdited = isEdited;
    this.image_path = image_path;
    this.name = name;
    this.status = status;
    this.date = date;
    this.acceptDate = acceptDate;
    this.acceptTime = acceptTime;
    this.workStatus = workStatus;
    this.workStartDate = workStartDate;
    this.workCompleteDate = workCompleteDate;
    this.location = location;
  }

  static async create({ userId, creatorId, language, location, description, amount, isThumbnail, isEdited, date }) {
    try {
      // Fetch user details (profile_image and fullName) based on userId
      const userQuery = "SELECT profile_image, firstName, lastName FROM users WHERE id = ?";
      const [userResult] = await pool.execute(userQuery, [userId]);
  
      if (userResult.length !== 1) {
        throw new Error("User not found");
      }
  
      const profile_image = userResult[0].profile_image !== null ? userResult[0].profile_image : null;
      const fullName = `${userResult[0].firstName} ${userResult[0].lastName}`;
      
      const insertQuery = "INSERT INTO requests (userId, creatorId, language, location, description, amount, isThumbnail, isEdited, image_path, name, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      
      const insertValues = [userId, creatorId, language, location, description, amount, isThumbnail, isEdited, profile_image, fullName, date];
      const [result] = await pool.execute(insertQuery, insertValues);
  
      if (result.affectedRows !== 1) {
        throw new Error("Request creation failed");
      }
  
      const newRequest = new Request({
        id: result.insertId,
        userId,
        creatorId,
        language,
        description,
        amount,
        isThumbnail,
        isEdited,
        date,
        image_path: profile_image,
        name: fullName,
        location
      });
      return newRequest;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  static async findLastRequestByUserAndCreatorId(userId, creatorId) {
    const query = "SELECT * FROM requests WHERE userId = ? AND creatorId = ? ORDER BY id DESC LIMIT 1";

    try {
      const [results] = await pool.execute(query, [userId, creatorId]);
      return results.length ? results[0] : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  static async findRequestById(requestId) {
    const query = "SELECT * FROM requests WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [requestId]);
      return results.length ? results[0] : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findRequestByCreatorOrUserId(requestId,userId) {
    const query = "SELECT * FROM requests WHERE creatorId = ? OR userId = ? ORDER BY id DESC";

    try {
      const [results] = await pool.execute(query, [requestId,userId]);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findRequestByCreatorId(requestId) {
    const query = "SELECT * FROM requests WHERE creatorId = ?";

    try {
      const [results] = await pool.execute(query, [requestId]);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAllRequests() {
    const query = "SELECT * FROM requests";

    try {
      const [result] = await pool.execute(query);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async deleteRequest(requestId) {
    const query = "DELETE FROM requests WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [requestId]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateRequestStatus(requestId, status, acceptDate, acceptTime) {
    const query = "UPDATE requests SET status = ?, acceptDate = ?, acceptTime = ? WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [status, acceptDate, acceptTime, requestId]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  static async updateWorkStatus(requestId, status, date) {
    const query = "UPDATE requests SET workStatus = ?, workStartDate = ? WHERE id = ?";
    try {
      const [results] = await pool.execute(query, [status, date, requestId]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateCompleteWorkStatus(requestId, status, date) {
    const query = "UPDATE requests SET workStatus = ?, workCompleteDate = ? WHERE id = ?";
    try {
      const [results] = await pool.execute(query, [status, date, requestId]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  static async getAllPendingWork(userId){
    const query = "SELECT * FROM requests WHERE creatorId = ? AND workStatus = 'live' ORDER BY id DESC";
    try {
      const [results] = await pool.execute(query, [userId]);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async getAllCompleteWork(userId){
    const query = "SELECT * FROM requests WHERE creatorId = ? AND workStatus = 'complete' ORDER BY id DESC";
    try {
      const [results] = await pool.execute(query, [userId]);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

module.exports = Request;
