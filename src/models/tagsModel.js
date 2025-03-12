const pool = require('../../db');

class Tags {
    constructor({id,tags,percentage,date}){
        this.id = id;
        this.tags = tags;
        this.percentage = percentage;
        this.date = date
    }

    static async create({ tags, percentage,date }) {
        let query = "INSERT INTO tags (tags, percentage, date) VALUES (?, ?, ?)";
        let values = [tags, percentage, date];
        try {
          const [result] = await pool.execute(query, values);
    
          if (result.affectedRows !== 1) {
            throw new Error("Banner creation failed");
          }
    
          const newBanner = new Tags({
            id: result.insertId,
            tags,
            percentage,
            date
          });
    
          return newBanner;
        } catch (error) {
          console.error(error);
          throw error;
        }
      }

      static async findByTag(tag) {
        let query = "SELECT * FROM tags WHERE tags LIKE ? ORDER BY percentage DESC";
        let likeTag = '%' + tag + '%';
        try {
            const [rows] = await pool.execute(query, [likeTag]);
            const tags = rows.map(row => new Tags(row));
            return tags;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

}

module.exports = Tags