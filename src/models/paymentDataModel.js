const pool = require("../../db");

class PaymentData {
  constructor({ id, userId, orderId, paymentTransactionId, paymentType, date, amount, paymentStatus }) {
    this.id = id;
    this.userId = userId;
    this.orderId = orderId;
    this.paymentTransactionId = paymentTransactionId;
    this.paymentType = paymentType;
    this.date = date;
    this.amount = amount;
    this.paymentStatus = paymentStatus;
  }

  static async create({ userId, orderId, paymentTransactionId, paymentType, date, amount, paymentStatus }) {
    const query = `
      INSERT INTO paymentData (userId, orderId, paymentTransactionId, paymentType, date, amount, paymentStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [userId, orderId, paymentTransactionId, paymentType, date, amount, paymentStatus];
    try {
      const [result] = await pool.execute(query, values);

      if (result.affectedRows !== 1) {
        throw new Error("Payment creation failed");
      }

      const id = result.insertId;
      return new PaymentData({ id, userId, orderId, paymentTransactionId, paymentType, date, amount, paymentStatus });
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

module.exports = PaymentData;
