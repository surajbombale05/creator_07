const pool = require("../../db");

class OpenAiData {
  constructor({ id,userId,type,message,createdAt, updatedAt,date}) {
    this.id = id;
    this.userId = userId;
    this.type = type;
    this.message = message;
    this.date = date
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static async create({ userId,type,message,date }) {
    const query =
      "INSERT INTO openai_datas (userId,type,message,date) VALUES (?, ?, ?, ?)";
    const values = [parseInt(userId),type,message,date];
    console.log(values)
    try {
      const [result] = await pool.execute(query, values);

      if (result.affectedRows !== 1) {
        throw new Error("OpenAI data creation failed");
      }

      const newOpenAiData = new OpenAiData({
        id: result.insertId,
        userId,
        type,
        message,
        date,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return newOpenAiData;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findOpenAiDataById(dataId) {
    const query = "SELECT * FROM openai_datas WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [dataId]);
      return results.length ? new OpenAiData(results[0]) : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findOpenAiDataByUserId(userId) {
    const query = "SELECT * FROM openai_datas WHERE userId = ?";

    try {
      const [results] = await pool.execute(query, [userId]);
      return results
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

}

module.exports = OpenAiData;