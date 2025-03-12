const pool = require("../../db");

class subcategories {
    constructor(id, name, categoryid, date) {
        this.id = id;
        this.name = name;
        this.date = date;
        this.categoryid = categoryid;
    }

    static async createSubCategories({name, date, categoryid}) {
        try {
          const query = 'INSERT INTO subCategory (name, date, categoryid) VALUES (?, ?, ?)';
          const values = [name,date,categoryid];
          const [result] = await pool.query(query, values);
          const data = {
            id: result.insertId,
            name: result.name,
            date: result.date,
            clientid: result.clientid
          }
          return data;
        } catch (error) {
          console.error('Error creating collaborator:', error);
          throw error;
        }
      }
    
    static async getAllSubCategories() {
        try {
            const query = 'SELECT * FROM subCategory';
            const [result] = await pool.query(query);
            return result;
        }catch(error){
            console.error('Error getting collaborators:', error);
            throw error;
        }
    }

    static async findByName(name) {
        try {
            const query = 'SELECT * FROM subCategory WHERE name = ?';
            const [result] = await pool.query(query, [name]);
            return result;
        } catch (error) {
            console.error('Error getting collaborator by name:', error);
            throw error;
        }
    }

    static async findsubCategoryById(categoryId) {
        const query = "SELECT * FROM subCategory WHERE categoryid = ? ORDER BY id DESC";
    
        try {
          const [results] = await pool.execute(query, [categoryId]);
          return results;
        } catch (error) {
          console.error(error);
          throw error;
        }
      }

      static async deleteCategoryById(categoryId) {
        const query = "DELETE FROM subCategory WHERE id = ?";
        try {
          const [results] = await pool.execute(query, [categoryId]);
          return results.affectedRows > 0;
        } catch (error) {
          console.error(error);
          throw error;
        }
      }

}

module.exports = subcategories