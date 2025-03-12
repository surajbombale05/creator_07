const pool = require("../../db");

class categories {
    constructor(id, name, createdAt, updatedAt,date) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    static async createCategories({name, date}) {
        try {
          const query = 'INSERT INTO categories (name, createdAt, updatedAt,date) VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP,?)';
          const values = [name,date];
          const [result] = await pool.query(query, values);
          const data = {
            id: result.insertId,
            name: result.name,
            date: result.date,
            createdAt: result.createdAt,
            updatedAt: result.updatedAt,
          }
          return data;
        } catch (error) {
          console.error('Error creating collaborator:', error);
          throw error;
        }
      }
    
    static async getCategories() {
        try {
            const query = 'SELECT * FROM categories ORDER BY id DESC';
            const [result] = await pool.query(query);
            return result;
        }catch(error){
            console.error('Error getting collaborators:', error);
            throw error;
        }
    }

    static async findByName(name) {
        try {
            const query = 'SELECT * FROM categories WHERE name = ?';
            const [result] = await pool.query(query, [name]);
            return result;
        } catch (error) {
            console.error('Error getting collaborator by name:', error);
            throw error;
        }
    }

    static async findCategoryById(categoryId) {
        const query = "SELECT * FROM categories WHERE id = ?";
    
        try {
          const [results] = await pool.execute(query, [categoryId]);
          return results.length ? results[0] : null;
        } catch (error) {
          console.error(error);
          throw error;
        }
      }

      static async deleteCategoryById(categoryId) {
        const query = "DELETE FROM categories WHERE id = ?";
        try {
          const [results] = await pool.execute(query, [categoryId]);
          return results.affectedRows > 0;
        } catch (error) {
          console.error(error);
          throw error;
        }
      }
}

module.exports = categories