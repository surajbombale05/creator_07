const pool = require("../../db");

class setReminder {
  constructor({ id, userId, title, date, time, reminderType, action }) {
    this.id = id;
    this.userId = userId;
    this.title = title;
    this.date = date,
    this.time = time;
    this.reminderType = reminderType
    this.action = action
  }

  static async createReminder({ userId, title, date, time, reminderType }) {
    const query = "INSERT INTO reminders (userId, title, date, time, reminderType) VALUES (?, ?, ?, ?, ?)";
    const values = [userId, title, date, time, reminderType];
        try {
          const [result] = await pool.execute(query, values);
    
          if (result.affectedRows !== 1) {
            throw new Error("Reminder creation failed");
          }
    
          const newReminder = new setReminder({
            id: result.insertId,
            userId,
            title,
            date,
            time,
            reminderType
          });
          return newReminder;
        } catch (error) {
          console.error(error);
          throw error;
        }
      }

      static async findAllReminder() {
        const query = "SELECT * FROM reminders";
        try {
          const [result] = await pool.execute(query);
          return result;
        } catch (error) {
          console.error(error);
          throw error;
        }
      }

      static async findAllReminderByUserId(userId) {
        const query = `
        SELECT *
        FROM reminders
        WHERE userId = ? 
        ORDER BY time
        `;
        try {
            const [result] = await pool.execute(query, [userId]);
            return result;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    static async updateAction(id, status) {
      const query = `UPDATE reminders SET action = ? WHERE id = ?`;
      const values = [status, id];
      try {
          const [result] = await pool.execute(query, values);
          return result.affectedRows > 0 ? true : false;
      } catch (error) {
          console.error(error);
          throw error;
      }
    }


    static async deleteReminder(id) {
      const query = "DELETE FROM reminders WHERE id = ?";
      try {
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0 ? true : false;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }
    
    static async findReminderById(id) {
      const query = "SELECT * FROM reminders WHERE id = ?";
      try {
        const [result] = await pool.execute(query, [id]);
        return result.length ? new setReminder(result[0]) : null;
      } catch (error) {
        console.error(error);
        throw error;
      }
  }

}
module.exports = setReminder;

