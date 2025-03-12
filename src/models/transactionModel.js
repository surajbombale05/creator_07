const pool = require("../../db");

class Transaction {
  constructor({ id, userId, balance, type, message, transactionType, reason, amount, date, withdrawId }) {
    this.id = id;
    this.userId = userId;
    this.balance = balance;
    this.type = type;
    this.message = message;
    this.transactionType = transactionType;
    this.reason = reason;
    this.amount = amount;
    this.date = date;
    this.withdrawId = withdrawId;
  }

  static async create({ userId, balance, type, message, transactionType, reason, amount, date, withdrawId }) {
    const query =
      "INSERT INTO transactions (userId, balance, type, message, transactionType, reason, amount, date, withdrawId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
    const values = [userId, balance, type, message, transactionType, reason, amount, date, withdrawId||null];
    try {
      const [result] = await pool.execute(query, values);

      if (result.affectedRows !== 1) {
        throw new Error("Transaction creation failed");
      }

      const newTransaction = new Transaction({
        id: result.insertId,
        userId,
        balance,
        type,
        message,
        transactionType,
        reason,
        amount,
        date,
        withdrawId
      });

      return newTransaction;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAllTransactions() {
    const query = "SELECT * FROM transactions";

    try {
      const [result] = await pool.execute(query);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findTransactionById(transactionId) {
    const query = "SELECT * FROM transactions WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [transactionId]);
      return results.length ? results[0] : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateTransaction(transactionId, { paymentStatus }) {
    const updateFields = [];
    const updateValues = [];

    if (paymentStatus !== undefined) {
      updateFields.push("payment_status = ?");
      updateValues.push(paymentStatus);
    }

    if (updateFields.length === 0) {
      return false; // No fields to update
    }

    const query = `
        UPDATE transactions
        SET ${updateFields.join(", ")}
        WHERE id = ?;
    `;
    try {
      const params = [...updateValues, transactionId];
      const [results] = await pool.execute(query, params);
      return results.affectedRows > 0 ? true : false;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findTransactionByRequestId(requestId) {
    const query = "SELECT * FROM transactions WHERE userId = ? ORDER BY id DESC";

    try {
      const [results] = await pool.execute(query, [requestId]);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}

module.exports = Transaction;
