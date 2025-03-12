const pool = require('../../db');

const createServerLog = async ({ encodedResponse }) => {
    const values = [JSON.stringify(encodedResponse)];
    
    const [result] = await pool.execute(
        'INSERT INTO server_log (encodedResponse, createdAt) VALUES (?, NOW())',
        values
    );

    if (result.affectedRows > 0) {
        const [rows] = await pool.execute('SELECT * FROM server_log WHERE id = ?', [result.insertId]);
        return rows[0];
    }
    return null;
};

const getAllServerLogs = async () => {
    const [rows] = await pool.execute('SELECT * FROM server_log');
    return rows;
};

const getServerLogById = async (id) => {
    const [rows] = await pool.execute('SELECT * FROM server_log WHERE id = ?', [id]);
    return rows.length ? rows[0] : null;
};

const deleteServerLog = async (id) => {
    const [result] = await pool.execute('DELETE FROM server_log WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

module.exports = {
    createServerLog,
    getAllServerLogs,
    getServerLogById,
    deleteServerLog
};
