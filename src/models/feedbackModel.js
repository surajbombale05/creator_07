const pool = require("../../db");

class FeedBack {
    constructor({ id, user_id, feedback_text, rating, date }) {
      this.id = id;
      this.user_id = user_id;
      this.feedback_text = feedback_text;
      this.rating = rating;
      this.date = date;
    }
  
    static async create({ user_id, feedback_text, rating, date }) {
      let query;
      let values;
  
      query = `INSERT INTO feedback (user_id, feedback_text, rating, date) VALUES (?, ?, ?, ?)`;
      values = [user_id, feedback_text, rating, date];
      try {
        const [result] = await pool.execute(query, values);
  
        if (result.affectedRows !== 1) {
          throw new Error("Banner creation failed");
        }
  
        const newBanner = new FeedBack({
          id: result.insertId,
          user_id,
          feedback_text,
          rating,
          date,
        });
  
        return newBanner;
      } catch (error) {
        console.error(error);
        throw error;
      }
    }

    static async getAllReviewUserId(userId) {
        const query = `SELECT * FROM feedback WHERE user_id = ?`;
        try {
          const [result] = await pool.execute(query, [userId]);
          return result;
        } catch (error) {
          console.error(error);
          throw error;
        }
}
}
module.exports = FeedBack;