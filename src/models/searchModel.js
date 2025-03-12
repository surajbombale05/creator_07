const pool = require("../../db");

class Search {
  static async search(keyword) {
    try {
      const tablesQuery = "SHOW TABLES";
      const [tables] = await pool.execute(tablesQuery);
      const results = [];

      for (const tableRow of tables) {
        const tableName = Object.values(tableRow)[0];
        const columnsQuery = `SHOW COLUMNS FROM ${tableName}`;
        const [columns] = await pool.execute(columnsQuery);

        const whereClause = columns.map(column => `${column.Field} LIKE '%${keyword}%'`).join(" OR ");

        const searchQuery = `SELECT * FROM ${tableName} WHERE ${whereClause}`;
        const [tableResults] = await pool.execute(searchQuery);

        const resultsWithSource = tableResults.map(result => ({ ...result, searchedFrom: tableName }));

        results.push(...resultsWithSource);
      }
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

module.exports = Search;
