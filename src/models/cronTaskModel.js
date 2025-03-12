const pool = require("../../db");

class CronTask {
  constructor({ id,task_id,task_type,tasktime }) {
    this.id = id;
    this.task_id = task_id;
    this.task_type = task_type,
    this.tasktime = tasktime
  }

  static async create({ task_id, task_type, tasktime }) {
    const query = `
        INSERT INTO cronTask (task_id, task_type, tasktime) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE 
            tasktime = VALUES(tasktime);
    `;
    const values = [task_id, task_type, tasktime];

    try {
        const [result] = await pool.execute(query, values);

        if (result.affectedRows === 0) {
            throw new Error("Cron Task creation failed");
        }

        const cronTask = new CronTask({
            id: result.insertId || task_id
        });

        return cronTask;
    } catch (error) {
        console.error(error);
        throw error;
    }
  }

  static async fetchTasksForCurrentTime() {
    const currentTimeUTC = new Date();
    const offsetIST = 5 * 60 * 60 * 1000 + 30 * 60 * 1000;
    const currentTimeIST = new Date(currentTimeUTC.getTime() + offsetIST);
    const formattedCurrentTimeIST = currentTimeIST.toISOString().slice(0, 19).replace('T', ' ');
    const query = "SELECT * FROM cronTask WHERE tasktime <= ? AND tasktime > NOW()";

    try {
      const [results] = await pool.execute(query, [formattedCurrentTimeIST]);
      return results.length ? results : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async deleteCronTask(taskId) {
    const query = "DELETE FROM cronTask WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [taskId]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

}

module.exports = CronTask;
