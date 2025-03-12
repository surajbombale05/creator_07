const pool = require('../../db');

const createSocialMedia = async ({ title = "", icon = "", link = "" }) => {
    const [result] = await pool.execute(
        'INSERT INTO social_media (title, icon, link, createdAt) VALUES (?, ?, ?, NOW())',
        [title, icon, link]
    );
    return result;
};

const getAllSocialMedia = async () => {
    const [rows] = await pool.execute('SELECT * FROM social_media');
    return rows;
};

const getSocialMediaById = async (id) => {
    const [rows] = await pool.execute('SELECT * FROM social_media WHERE id = ?', [id]);
    return rows.length ? rows[0] : null;
};

const updateSocialMedia = async (id, { title, icon, link }) => {
    const updateFields = [];
    const updateValues = [];

    if (title !== undefined && title.trim() !== '') {
        updateFields.push("title = ?");
        updateValues.push(title);
    }

    if (icon !== undefined && icon.trim() !== '') {
        updateFields.push("icon = ?");
        updateValues.push(icon);
    }

    if (link !== undefined && link.trim() !== '') {
        updateFields.push("link = ?");
        updateValues.push(link);
    }

    if (updateFields.length === 0) {
        return false; // No fields to update
    }

    updateValues.push(id);
    
    const query = `UPDATE social_media SET ${updateFields.join(", ")} WHERE id = ?`;
    const [result] = await pool.execute(query, updateValues);
    
    return result.affectedRows > 0;
};

const deleteSocialMedia = async (id) => {
    const [result] = await pool.execute('DELETE FROM social_media WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

module.exports = {
    createSocialMedia,
    getAllSocialMedia,
    getSocialMediaById,
    updateSocialMedia,
    deleteSocialMedia
};
