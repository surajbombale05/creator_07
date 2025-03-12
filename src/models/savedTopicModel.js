const pool = require("../../db");

class SavedTopic {
  constructor({ id, userId, topicIds }) {
    this.id = id;
    this.userId = userId;
    this.topicIds = topicIds;
  }

  static async create({ userId, topicIds }) {
    const query = "INSERT INTO saved_topics (user_id, topic_ids) VALUES (?, ?)";
    console.log(userId,topicIds)
    try {
      const [result] = await pool.execute(query, [userId, JSON.stringify(topicIds)]);

      if (result.affectedRows !== 1) {
        throw new Error("SavedTopic creation failed");
      }

      const newSavedTopic = new SavedTopic({
        id: result.insertId,
        userId,
        topicIds,
      });

      return newSavedTopic;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findSavedTopicById(savedTopicId) {
    const query = "SELECT * FROM saved_topics WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [savedTopicId]);
      return results.length ? results[0] : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAllSavedTopics() {
    const query = "SELECT * FROM saved_topics";

    try {
      const [result] = await pool.execute(query);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateSavedTopic(savedTopicId, { userId, topicIds }) {
    const query = "UPDATE saved_topics SET user_id = ?, topic_ids = ? WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [userId, JSON.stringify(topicIds), savedTopicId]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async deleteSavedTopic(savedTopicId) {
    const query = "DELETE FROM saved_topics WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [savedTopicId]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findSavedTopicByUserId(savedTopicId) {
    const query = "SELECT * FROM saved_topics WHERE user_id = ?";

    try {
      const [results] = await pool.execute(query, [savedTopicId]);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateSavedTopicByUserId(userId, { topicIds }) {
    const query = "UPDATE saved_topics SET topic_ids = ? WHERE user_id = ?";

    try {
      const [results] = await pool.execute(query, [JSON.stringify(topicIds), userId]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

}

module.exports = SavedTopic;
