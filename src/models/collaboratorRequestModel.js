const pool = require("../../db");

class collaboratorRequest {
  constructor({ id, userId, collaboratorId, description, image_path, name, status, acceptDate, acceptTime, date }) {
    this.id = id;
    this.userId = userId;
    this.collaboratorId = collaboratorId;
    this.description = description;
    this.image_path = image_path;
    this.name = name;
    this.status = status;
    this.acceptDate = acceptDate;
    this.acceptTime = acceptTime;
    this.date = date;
  }

  static async create({ userId, collaboratorId, image_path, name, description, date }) {
    try {
      
      const insertQuery = "INSERT INTO collaboratorRequest (userId, collaboratorId, description, image_path, name, date) VALUES (?, ?, ?, ?, ?, ?)";
      const insertValues = [userId, collaboratorId, description, image_path||null, name, date];
      const [result] = await pool.execute(insertQuery, insertValues);
  
      if (result.affectedRows !== 1) {
        throw new Error(" Collaborator Request creation failed");
      }
  
      const newRequest = new collaboratorRequest({
        id: result.insertId,
        userId,
        collaboratorId,
        description,
        image_path: image_path,
        name: name,
        date
      });
      return newRequest;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  
  
  static async findCollaboratorRequestById(requestId) {
    const query = "SELECT * FROM collaboratorRequest WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [requestId]);
      return results.length ? results[0] : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findRequestByCollaboratorId(requestId) {
    const query = "SELECT * FROM collaboratorRequest WHERE collaboratorId = ?";

    try {
      const [results] = await pool.execute(query, [requestId]);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAllcollaboratorRequests() {
    const query = "SELECT * FROM collaboratorRequest";

    try {
      const [result] = await pool.execute(query);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async deletecollaboratorRequest(requestId) {
    const query = "DELETE FROM collaboratorRequest WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [requestId]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateCollaboratorStatus(requestId, status, acceptDate, acceptTime) {
    const query = "UPDATE collaboratorRequest SET status = ?, acceptDate = ?, acceptTime = ? WHERE id = ?";
    try {
      const [results] = await pool.execute(query, [status, acceptDate, acceptTime, requestId]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  
}

module.exports = collaboratorRequest;
