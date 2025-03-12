const pool = require("../../db");

class ClicksUpdater {
  static async updateClicksAndViews(tableName, id) {
    const query = `UPDATE ${tableName} SET clicks = clicks + 1, views = views + 1 WHERE id = ?`;
    try {
      const [result] = await pool.execute(query, [id]);
  
      if (result.affectedRows !== 1) {
        throw new Error("Failed to update clicks and views");
      }
  
      return true; 
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  

  static async findUserById(tableName, idColumnName, id) {
    const query = `SELECT * FROM ${tableName} WHERE ${idColumnName} = ?`;

    try {
      const [results] = await pool.execute(query, [id]);
      return results.length ? results[0] : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
}


static async updateViewedBy(tableName, id, userId) {
  try {
    const [rows] = await pool.execute(`SELECT viewedBy FROM ${tableName} WHERE id = ?`, [id]);
    const viewedByArray = rows[0].viewedBy;
    const updatedViewedByArray = viewedByArray ? JSON.parse(viewedByArray) : [];
    updatedViewedByArray.push(userId);
    const updateQuery = `UPDATE ${tableName} SET viewedBy = ? WHERE id = ?`;
    const [result] = await pool.execute(updateQuery, [JSON.stringify(updatedViewedByArray), id]);

    if (result.affectedRows !== 1) {
      throw new Error("Failed to update viewedBy");
    }

    return true; 
  } catch (error) {
    console.error(error);
    throw error;
  }
}

}

module.exports = ClicksUpdater;
