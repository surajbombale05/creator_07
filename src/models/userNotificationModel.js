const pool = require('../../db');

class userNotification {
    constructor(id, userId, title, message, url, imagePath, userType, dateRange, createdAt, updatedAt, date) {
        this.id = id;
        this.userId = userId;
        this.title = title;
        this.message = message;
        this.url = url;
        this.imagePath = imagePath;
        this.userType = userType;
        this.dateRange = dateRange;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.date = date;
    }

    static async create({ userId, title, message, url, imagePath, userType, dateRange, date }) {
        const query = `
            INSERT INTO usernotification (userId, title, message, url, imagePath, userType, dateRange, createdAt, updatedAt, date)
            VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?)
        `;
        const values = [userId, title, message, url||null, imagePath||null, userType, dateRange, date];
        try {
            const [result] = await pool.execute(query, values);
            return result.insertId;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    }

    static async findNotificationsByUserId(userId, date) {
        const query = `
            SELECT * FROM usernotification
            WHERE userId = ? AND DATE(date) = ? AND dateRange = 'single_user'
            ORDER BY id DESC LIMIT 1
        `;
        try {
            const [results] = await pool.execute(query, [userId, date]);
            return results;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
    
    static async findInAppNotificationsByUserId(userId, date) {
        const query = `
            SELECT * FROM usernotification
            WHERE userId = ? AND DATE(date) = ? AND dateRange = 'in_app_notification'
            ORDER BY id DESC LIMIT 1
        `;
        try {
            const [results] = await pool.execute(query, [userId, date]);
            return results;
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}

module.exports = userNotification;
