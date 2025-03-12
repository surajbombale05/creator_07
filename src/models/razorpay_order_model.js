const pool = require("../../db");

const createOrder = async ({ orderId, amount, currency = "INR", status = "created" }) => {
    const values = [orderId, amount, currency, status];

    const [result] = await pool.execute(
        'INSERT INTO razorpay_order (orderId, amount, currency, status, createdAt) VALUES (?, ?, ?, ?, NOW())',
        values
    );

    if (result.affectedRows > 0) {
        const [rows] = await pool.execute('SELECT * FROM razorpay_order WHERE id = ?', [result.insertId]);
        return rows[0];
    }
    return null;
};

const getAllOrders = async () => {
    const [rows] = await pool.execute('SELECT * FROM razorpay_order');
    return rows;
};

const getOrderById = async (id) => {
    const [rows] = await pool.execute('SELECT * FROM razorpay_order WHERE id = ?', [id]);
    return rows.length ? rows[0] : null;
};

const deleteOrder = async (id) => {
    const [result] = await pool.execute('DELETE FROM razorpay_order WHERE id = ?', [id]);
    return result.affectedRows > 0;
};

module.exports = {
    createOrder,
    getAllOrders,
    getOrderById,
    deleteOrder
};
