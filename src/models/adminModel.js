const pool = require("../../db");

class Admin {
  constructor({ id, name, mobile, type, date, email, password, apiToken, createdAt, updatedAt,image, dashboard, users, revenue, services, withdraw, googleads, topics, socialupdate, posts, notification, updateversion, settings, teams, userStatus, balance }) {
    this.id = id;
    this.name = name;
    this.mobile = mobile;
    this.type = type;
    this.date = date;
    this.email = email;
    this.password = password;
    this.apiToken = apiToken;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.image = image;
    this.dashboard = dashboard;
    this.users = users;
    this.revenue = revenue;
    this.services = services;
    this.withdraw = withdraw;
    this.googleads = googleads;
    this.topics = topics;
    this.socialupdate = socialupdate;
    this.posts = posts;
    this.notification = notification;
    this.updateversion = updateversion;
    this.settings = settings;
    this.userStatus = userStatus;
    this.teams = teams;
    this.balance = balance;
  }

  static async create({ name, mobile, type, date, email, password, apiToken, dashboard, users, revenue, services, withdraw, googleads, topics, socialupdate, posts, notification, updateversion, settings, teams }) {
    const query =
      "INSERT INTO admin (name, mobile, type, date, email, password, apiToken, createdAt, updatedAt, dashboard, users, revenue, services, withdraw, googleads, topics, socialupdate, posts, notification, updateversion, settings, teams) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [name, mobile, type, date, email, password, apiToken||null, new Date(), new Date(), dashboard, users, revenue, services, withdraw, googleads, topics, socialupdate, posts, notification, updateversion, settings, teams];
    try {
      const [result] = await pool.execute(query, values);

      if (result.affectedRows !== 1) {
        throw new Error("Admin creation failed");
      }

      const newAdmin = new Admin({
        id: result.insertId,
        name,
        mobile,
        type,
        date,
        email,
        password,
        apiToken,
        createdAt: new Date(),
        updatedAt: new Date(),
        dashboard,
        users,
        revenue,
        services,
        withdraw,
        googleads,
        topics,
        socialupdate,
        posts,
        notification,
        updateversion,
        settings,
        teams
      });

      return newAdmin;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAdminById(adminId) {
    const query = "SELECT * FROM admin WHERE id = ? ORDER BY id DESC";

    try {
      const [results] = await pool.execute(query, [adminId]);
      return results.length ? new Admin(results[0]) : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAdminByEmail(email) {
    const query = "SELECT * FROM admin WHERE email = ?";

    try {
      const [results] = await pool.execute(query, [email]);
      return results.length ? new Admin(results[0]) : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findByMobile(mobile) {
    const query = "SELECT * FROM admin WHERE mobile = ?";
    try {
      const [results] = await pool.execute(query, [mobile]);
      return results.length ? new Admin(results[0]) : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async checkAdminCredentaials(email) {
    const query = "SELECT * FROM admin WHERE email = ? ";
    try {
      const [results] = await pool.execute(query, [email]);
      return results.length ? new Admin(results[0]) : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  static async findAllTeamMember(){

    const query = "SELECT * FROM admin WHERE type = 'team' ORDER BY id DESC ";

    try {
      const [results] = await pool.execute(query);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateTeamMember(teamId, {
    image,
    name,
    email,
    mobile,
    password,
    users,
    topics,
    socialupdate,
    posts,
  }) {
    const updateFields = [];
    const updateValues = [];
    
    if (image !== undefined) {
      updateFields.push("image = ?");
      updateValues.push(image);
    }

    if (name !== undefined) {
      updateFields.push("name = ?");
      updateValues.push(name);
    }

    if (email !== undefined) {
      updateFields.push("email = ?");
      updateValues.push(email);
    }

    if (mobile !== undefined) {
      updateFields.push("mobile = ?"); 
      updateValues.push(mobile);
    }

    if (password !== undefined) {
      updateFields.push("password = ?");
      updateValues.push(password);
    }

    if(users !== undefined){
      updateFields.push("users = ?");
      updateValues.push(users);
    }

    if(topics !== undefined){
      updateFields.push("topics = ?");
      updateValues.push(topics);
    }

    if(socialupdate !== undefined){
      updateFields.push("socialupdate = ?");
      updateValues.push(socialupdate);
    }

    if(posts !== undefined){
      updateFields.push("posts = ?");
      updateValues.push(posts);
    }


    if (updateFields.length === 0) {
      return false; // No fields to update
    }

    const query = `
      UPDATE admin
      SET ${updateFields.join(", ")}
      WHERE id = ?;
    `;
    try {
      const params = [...updateValues, teamId];
      const [results] = await pool.execute(query, params);
      return results.affectedRows > 0 ? true : false;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  static async deleteTeamMember(teamId) {
    const query = "DELETE FROM admin WHERE id = ?";
    try {
      const [results] = await pool.execute(query, [teamId]);
      return results.affectedRows > 0 ? true : false;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updatePassword(adminId, password) {
    const query = "UPDATE admin SET password = ? WHERE id = ?";
    try {
      const [results] = await pool.execute(query, [password, adminId]);
      return results.affectedRows > 0 ? true : false;
    } catch (error) {
      console.error(error);
      throw error;
    }
}


static async updateStatus(id, status) {
  const query = "UPDATE admin SET userStatus = ? WHERE id = ?";
  try {
    const [result] = await pool.execute(query, [status, id]);
    return result.affectedRows > 0 ? true : false;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

static async updateApiToken(id, apiToken) {
  const query = "UPDATE admin SET apiToken = ? WHERE id = ?";
  try {
    const [result] = await pool.execute(query, [apiToken, id]);
    return result.affectedRows > 0 ? true : false;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

static async addAdminAmount(userId, amount) {
    console.log("addAmount", userId, amount);
    const user = await this.findAdminById(userId);
    if (!user) {
      throw new Error("User not found");
    } 
    const newBalance = user.balance + parseInt(amount, 10);
    const query = "UPDATE admin SET balance = ? WHERE id = ?";
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

  static async findAdmin () {
    const query = "SELECT * FROM admin WHERE type = 'admin' ";
    try {
      const [results] = await pool.execute(query);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  static async updateAdmin(adminId, {
    image,
    name,
    email,
    mobile,
    password
  }){   
  const updateFields = [];
  const updateValues = [];
  
  if (image !== undefined) {
    updateFields.push("image = ?");
    updateValues.push(image);
  }
  
  if (name !== undefined) {
    updateFields.push("name = ?");
    updateValues.push(name);
  }
  
  if (email !== undefined) {
    updateFields.push("email = ?");
    updateValues.push(email); 
  }
  
  if (mobile !== undefined) {
    updateFields.push("mobile = ?");
    updateValues.push(mobile);
  }
  
  if (password !== undefined) {
    updateFields.push("password = ?");
    updateValues.push(password);
  }
  
  if (updateFields.length === 0) {
    return false; // No fields to update
  }
  
  const query = `
    UPDATE admin
    SET ${updateFields.join(", ")}
    WHERE id = ?;
  `;
  try {
    const params = [...updateValues, adminId];
    const [results] = await pool.execute(query, params);
    return results.affectedRows > 0 ? true : false;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

}
module.exports = Admin;
