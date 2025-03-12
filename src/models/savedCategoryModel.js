const pool = require('../../db');

class savedCategory {
    constructor({id,userId,categoryId,subCategory}) {
        this.id = id;
        this.userId = userId;
        this.categoryId = categoryId;
        this.subCategoryId = subCategory;
    }

    static async create({ userId, categoryId, subCategory }) {
        let query = "INSERT INTO savedCategory (userId, categoryId, subCategory) VALUES (?, ?, ?)";
        let values = [userId, categoryId, subCategory||null];
        try {
          const [result] = await pool.execute(query, values);
    
          if (result.affectedRows !== 1) {
            throw new Error("Banner creation failed");
          }
    
          const newBanner = new savedCategory({
            id: result.insertId,
            userId,
            categoryId,
            subCategory
          });
          return newBanner;
        } catch (error) {
          console.error(error);
          throw error;
        }
      }

      static async findSavedCategoryByUserId(userId) {
        //const query = "SELECT * FROM savedCategory WHERE userId = ?";
        const query = "SELECT sc.categoryId, sc.subcategory, c.name as catname, s.name as subcatname FROM savedCategory AS sc LEFT JOIN categories AS c ON sc.categoryId = c.id LEFT JOIN subCategory AS s ON s.id = sc.subcategory WHERE sc.userId = ?";
        try {
          const [results] = await pool.execute(query, [userId]);
          return results.length ? results[0] : null;

        } catch (error) {
          console.error(error);
          throw error;
        }
      }

      static async updatesavedCategoryByUserId(userId, {
        categoryId,
        subCategory
    }) {
        const updateFields = [];
        const updateValues = [];

        if (categoryId !== undefined) {
            updateFields.push("categoryId = ?");
            updateValues.push(categoryId);
        }
        if (subCategory !== undefined) {
            console.log(subCategory);
            updateFields.push("subCategory = ?");
            updateValues.push(subCategory);
        }
        
    
        if (updateFields.length === 0) {
            return false; 
        }
    
        const query = `
            UPDATE savedCategory
            SET ${updateFields.join(", ")}
            WHERE userId = ?;
        `;
        try {
            const params = [...updateValues, userId];
            console.log(params);
            const [results] = await pool.execute(query, params);
            return results.affectedRows > 0 ? true : false;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

module.exports = savedCategory;