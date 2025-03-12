const pool = require('../../db');

const createTicker = async ({ link = "", title = "", background_color = "", text_color = "", link_color = ""}) => {
    const [result] = await pool.execute(
        'INSERT INTO ticker (link, title, background_color, text_color, link_color) VALUES (?, ?, ?, ?, ?)',
        [link, title, background_color, text_color, link_color]
    );
    return result.insertId;
};

const getAllTickers = async () => {
    const [rows] = await pool.execute('SELECT * FROM ticker');
    return rows;
};

const getTickerById = async (id) => {
    const [rows] = await pool.execute('SELECT * FROM ticker WHERE id = ?', [id]);
    return rows.length ? rows[0] : null;
};

const updateTicker = async (id, { link, title, background_color, text_color, link_color }) => {
    const updateFields = [];
    const updateValues = [];

    if (link !== undefined && link.trim() !== '') {
        updateFields.push("link = ?");
        updateValues.push(link);
    }

    if (title !== undefined && title.trim() !== '') {
        updateFields.push("title = ?");
        updateValues.push(title);
    }

    if (background_color !== undefined && background_color.trim() !== '') {
        updateFields.push("background_color = ?");
        updateValues.push(background_color);
    }

    if (text_color !== undefined && text_color.trim() !== '') {
        updateFields.push("text_color = ?");
        updateValues.push(text_color);
    }

    if (link_color !== undefined && link_color.trim() !== '') {
        updateFields.push("link_color = ?");
        updateValues.push(link_color);
    }

    if (updateFields.length === 0) {
        return false; // No fields to update
    }

    const query = `
        UPDATE ticker
        SET ${updateFields.join(", ")}
        WHERE id = ?;
    `;

    try {
        const params = [...updateValues, id];
        const [results] = await pool.execute(query, params);
        return results.affectedRows > 0;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

const deleteTicker = async (id) => {
    const [result] = await pool.execute('DELETE FROM ticker WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

module.exports = {
    createTicker,
    getAllTickers,
    getTickerById,
    updateTicker,
    deleteTicker
};
