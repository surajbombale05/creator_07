const pool = require('../../db');
const createVideo = async ({ title = "", category = "", thumbnail = "", url = "", button_text_color = "", video = "" }) => {
    const values = [
        title ?? null, 
        category ?? null, 
        thumbnail ?? null, 
        url ?? null,
        button_text_color ?? null,
        video ?? null
    ];
    
    const [result] = await pool.execute(
        'INSERT INTO video (title, category, thumbnail, url, button_text_color, video, createdAt) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        values
    );

    if (result.affectedRows > 0) {
        const [rows] = await pool.execute('SELECT * FROM video WHERE id = ?', [result.insertId]);
        return rows[0];
    }
    return null;
};

const getAllVideos = async () => {
    const [rows] = await pool.execute('SELECT * FROM video');
    return rows;
};

const getVideoById = async (id) => {
    const [rows] = await pool.execute('SELECT * FROM video WHERE id = ?', [id]); // Properly pass array
    return rows.length ? rows[0] : null;
};

const updateVideo = async (id, { title, category, thumbnail, url, video }) => {
    const updateFields = [];
    const updateValues = [];

    if (title && title.trim() !== "") {
        updateFields.push("title = ?");
        updateValues.push(title);
    }

    if (category && category.trim() !== "") {
        updateFields.push("category = ?");
        updateValues.push(category);
    }

    if (thumbnail && thumbnail.trim() !== "") {
        updateFields.push("thumbnail = ?");
        updateValues.push(thumbnail);
    }

    if (url && url.trim() !== "") {
        updateFields.push("url = ?");
        updateValues.push(url);
    }

    if (video && video.trim() !== "") {
        updateFields.push("video = ?");
        updateValues.push(video);
    }

    if (updateFields.length === 0) {
        return false;
    }

    updateValues.push(id);

    const query = `UPDATE video SET ${updateFields.join(", ")} WHERE id = ?`;

    try {
        if (!Array.isArray(updateValues)) {
            throw new Error("updateValues is not an array");
        }

        const [result] = await pool.execute(query, updateValues);

        return result.affectedRows > 0;
    } catch (error) {
        console.error("Database Error:", error);
        return false;
    }
};

const deleteVideo = async (id) => {
    const [result] = await pool.execute('DELETE FROM video WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

module.exports = {
    createVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo
};
