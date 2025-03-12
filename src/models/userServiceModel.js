const pool = require("../../db");

class userService {
  constructor(
    id,
    userId,
    amount,
    serviceId,
    serviceType,
    serviceTakenDate,
    serviceExpiryDate,
    serviceStatus
  ) {
    this.id = id;
    this.userId = userId;
    this.amount = amount;
    this.serviceId = serviceId;
    this.serviceType = serviceType;
    this.serviceTakenDate = serviceTakenDate;
    this.serviceExpiryDate = serviceExpiryDate;
    this.serviceStatus = serviceStatus;
  }

  static async createUserService({
    userId,
    amount,
    serviceId,
    serviceType,
    serviceTakenDate,
    serviceExpiryDate,
  }) {
    try {
      const query =
        "INSERT INTO userService (userId, amount, serviceId, serviceType, serviceTakenDate, serviceExpiryDate) VALUES (?, ?, ?, ?, ?, ?)";
      const values = [
        userId,
        amount,
        serviceId,
        serviceType,
        serviceTakenDate,
        serviceExpiryDate,
      ];
      console;
      const [result] = await pool.query(query, values);
      const data = {
        id: result.insertId,
        userId: userId,
        amount: amount,
        serviceId: serviceId,
        serviceType: serviceType,
        serviceTakenDate: serviceTakenDate,
        serviceExpiryDate: serviceExpiryDate,
      };
      return data;
    } catch (error) {
      console.error("Error creating collaborator:", error);
      throw error;
    }
  }

  static async findUserServicesByUserId(userId) {
    try {
      const query =
        "SELECT userService.*, services.title AS title, services.image_path AS image FROM userService INNER JOIN services ON userService.serviceId = services.id WHERE userService.userId = ? AND userService.serviceStatus = 'live'";
      const [result] = await pool.query(query, [userId]);
      return result;
    } catch (error) {
      console.error("Error getting collaborator by name:", error);
      throw error;
    }
  }

  static async findAllUserServices() {
    const query = `SELECT 
    us.*, 
    s.title, 
    CONCAT(u.firstName, ' ', u.lastName) AS fullname, 
    u.mobile, 
    u.profile_image
FROM userService us
JOIN services s ON us.serviceId = s.id
JOIN users u ON us.userId = u.id
ORDER BY us.id DESC;
`;
    try {
      const [results] = await pool.query(query);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAllServiceCount(serviceId, date) {
    const query = `
        SELECT 
            COUNT(*) AS totalUserCount,
            SUM(CASE WHEN Date(serviceExpiryDate) <= ? THEN 1 ELSE 0 END) AS expiredUserCount,
            SUM(CASE WHEN Date(serviceExpiryDate) > ? THEN 1 ELSE 0 END) AS activeUserCount
        FROM userService 
        WHERE serviceId = ?;
    `;

    try {
      const [results] = await pool.query(query, [date, date, serviceId]);
      return {
        totalUserCount: results[0].totalUserCount || 0,
        expiredUserCount: parseInt(results[0].expiredUserCount, 10) || 0,
        activeUserCount: parseInt(results[0].activeUserCount, 10) || 0,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAllServiceById(serviceId) {
    const query = "SELECT * FROM userService WHERE serviceId = ?";
    try {
      const [results] = await pool.query(query, [serviceId]);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAllServiceReports(serviceId, type, date) {
    let query;
    let values;
    if (type === "user") {
      query = `
    SELECT 
        CONCAT(u.firstName, ' ', u.lastName) AS userName,
        u.profile_image,
        u.mobile,
        us.serviceTakenDate,
        us.serviceExpiryDate,
        s.title,
        s.price
    FROM 
        userService us
    INNER JOIN 
        users u ON us.userId = u.id
        INNER JOIN 
        services s ON us.serviceId = s.id
    WHERE 
        us.serviceId = ?;
`;

      values = [serviceId];
    }else if(type === "expire"){
      query = `
    SELECT 
        CONCAT(u.firstName, ' ', u.lastName) AS userName,
        u.profile_image,
        u.mobile,
        us.serviceTakenDate,
        us.serviceExpiryDate,
        s.title,
        s.price
    FROM 
        userService us
    INNER JOIN 
        users u ON us.userId = u.id
        INNER JOIN 
        services s ON us.serviceId = s.id
    WHERE 
        us.serviceId = ? AND DATE(us.serviceExpiryDate) < ?;
`;

      values = [serviceId, date];
    }else if(type === "active"){
      query = `SELECT
        CONCAT(u.firstName, ' ', u.lastName) AS userName,
        u.profile_image,
        u.mobile,
        us.serviceTakenDate,
        us.serviceExpiryDate,
        s.title,
        s.price
    FROM
        userService us
    INNER JOIN
        users u ON us.userId = u.id
        INNER JOIN
        services s ON us.serviceId = s.id
    WHERE
        us.serviceId = ? AND DATE(us.serviceExpiryDate) > ?;`;
      values = [serviceId, date];
    }
      try {
        const [results] = await pool.query(query, values);
        return results;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }


    static async updateServiceStatus(id, serviceStatus) {
      const query = "UPDATE userService SET serviceStatus = ? WHERE id = ?;";
      const values = [serviceStatus, id];
      try {
        const [result] = await pool.query(query, values);
        return result.affectedRows > 0;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }


    static async findServiceById(serviceId) {
      const query = "SELECT * FROM userService WHERE id = ?";
      try {
        const [results] = await pool.query(query, [serviceId]);
        return results.length ? results[0] : null;
      } catch (error) {
        console.error(error); 
        throw error;
      }
    }
  }

module.exports = userService;
