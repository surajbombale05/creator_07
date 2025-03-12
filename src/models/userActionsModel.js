const pool = require("../../db");

class UserActions {
  constructor({id, userId, actions, date }) {
    this.id = id;
    this.userId = userId;
    this.actions = actions;
    this.date = date;
  }

  static async create({ userId, actions, date }) {
    const query = "INSERT INTO UserActions (userId, actions, date) VALUES (?, ?, ?)";
    const values = [userId, JSON.stringify(actions), date];
    try {
      const [result] = await pool.execute(query, values);
        if (result.affectedRows !== 1) {
            throw new Error("UserActions creation failed");
          }
    
          const newUserActions = new UserActions({
            id: result.id,
            userId,
            actions,
            date
          });
          return newUserActions;
        } catch (error) {
          console.error(error);
          throw error;
        }
      }
    
      static async findUserActionsByUserId(userId) {
        const query = "SELECT * FROM UserActions WHERE userId = ?";
        try {
          const [results] = await pool.execute(query, [userId]);
          return results;
        } catch (error) {
          console.error(error);
          throw error;
        }
      }
    
      static async findAllUserActions() {
        const query = "SELECT * FROM UserActions";
    
        try {
          const [result] = await pool.execute(query);
          return result;
        } catch (error) {
          console.error(error);
          throw error;
        }
      }
    
      static async deleteUserActions(userId) {
        const query = "DELETE FROM UserActions WHERE userId = ?";
    
        try {
          const [results] = await pool.execute(query, [userId]);
          return results.affectedRows > 0;
        } catch (error) {
          console.error(error);
          throw error;
        }
      }
    
      static async updateUserActions(userId, { actions, date }) {
        const query = "UPDATE UserActions SET actions = ?, date = ? WHERE userId = ?";
        const values = [JSON.stringify(actions), date, userId];
    
        try {
          const [results] = await pool.execute(query, values);
          return results.affectedRows > 0 ? true : false;
        } catch (error) {
          console.error(error);
          throw error;
        }
      }


      static async findActionByUserIdAndDate(userId, date) {
        const query = "SELECT * FROM UserActions WHERE userId = ? AND DATE(date) = ? ORDER BY id DESC";
        try {
          const [results] = await pool.execute(query, [userId, date]);
          return results;
        } catch (error) {
          console.error(error);
          throw error;
        }
      }

      static async updateUserActions(userId,actions) {
        console.log(actions)
        const query = "UPDATE UserActions SET actions = JSON_SET(actions, '$', ?) WHERE userId = ?";
        const values = [JSON.stringify(actions),userId];
        console.log(values)
        try {
          const [results] = await pool.execute(query, values);
          return results.affectedRows > 0 ? true : false;
        } catch (error) {
          console.error(error);
          throw error;
        }
      }
      
}
    module.exports = UserActions;
    