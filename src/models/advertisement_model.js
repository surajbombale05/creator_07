const pool = require('../../db');
const createAdvertisement = async ({ photo, is_photo, url, button_text, button_text_color, button_background_color, video }) => {
    // Ensure no undefined values are passed
    const values = [
        photo ?? null, 
        is_photo ?? null, 
        url ?? null, 
        button_text ?? null, 
        button_text_color ?? null, 
        button_background_color ?? null, 
        video ?? null
    ];

    const [result] = await pool.execute(
        'INSERT INTO advertisement (photo, is_photo, url, button_text, button_text_color, button_background_color, video, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())',
        values
    );

    if (result.affectedRows > 0) {
        const [rows] = await pool.execute('SELECT * FROM advertisement WHERE id = ?', [result.insertId]);
        return rows[0]; // Return inserted data
    }

    return null;
};


const getAllAdvertisements = async () => {
    const [rows] = await pool.execute('SELECT * FROM advertisement');
    return rows;
};

const getAdvertisementById = async (id) => {
    const [rows] = await pool.execute('SELECT * FROM advertisement WHERE id = ?', [id]);
    return rows.length ? rows[0] : null;
};

const updateAdvertisement = async (id, { photo, is_photo, url, button_text, button_text_color, button_background_color, video }) => {
    const updateFields = [];
    const updateValues = [];

    if (photo !== undefined) {
        updateFields.push("photo = ?");
        updateValues.push(photo);
    }
    if (is_photo !== undefined) {
        updateFields.push("is_photo = ?");
        updateValues.push(is_photo);
    }
    if (url !== undefined) {
        updateFields.push("url = ?");
        updateValues.push(url);
    }
    if (button_text !== undefined) {
        updateFields.push("button_text = ?");
        updateValues.push(button_text);
    }
    if (button_text_color !== undefined) {
        updateFields.push("button_text_color = ?");
        updateValues.push(button_text_color);
    }
    if (button_background_color !== undefined) {
        updateFields.push("button_background_color = ?");
        updateValues.push(button_background_color);
    }
    if (video !== undefined) {
        updateFields.push("video = ?");
        updateValues.push(video);
    }

    if (updateFields.length === 0) {
        return false;
    }

    updateValues.push(id);
    const query = `UPDATE advertisement SET ${updateFields.join(", ")} WHERE id = ?`;
    const [result] = await pool.execute(query, updateValues);
    
    return result.affectedRows > 0;
};

const deleteAdvertisement = async (id) => {
    const [result] = await pool.execute('DELETE FROM advertisement WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

module.exports = {
    createAdvertisement,
    getAllAdvertisements,
    getAdvertisementById,
    updateAdvertisement,
    deleteAdvertisement
};
