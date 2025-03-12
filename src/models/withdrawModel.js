// withdrawRequestModel.js

const pool = require("../../db");

class WithdrawRequest {
  constructor({
    id,
    userId,
    amount,
    toAccount,
    date,
    approveDate,
    approveTime,
    status,
    reason,
  }) {
    this.id = id;
    this.userId = userId;
    this.amount = amount;
    this.toAccount = toAccount;
    this.date = date;
    this.approveDate = approveDate;
    this.approveTime = approveTime;
    this.status = status;
    this.reason = reason;
  }

  static async create({ userId, amount, toAccount, date }) {
    const query = `INSERT INTO withdraw_requests (userId, amount, toAccount, date) VALUES (?, ?, ?, ?)`;
    try {

      const updateUserBalanceQuery = `UPDATE users SET balance = balance - ? WHERE id = ?;`;
      await pool.execute(updateUserBalanceQuery, [amount, userId]);
      const values = [userId, amount, toAccount, date];
      const [result] = await pool.execute(query, values);
      if (result.affectedRows !== 1) {
        throw new Error("Withdraw request creation failed");
      }

      const newWithdrawRequest = new WithdrawRequest({
        id: result.insertId,
        userId,
        amount,
        toAccount,
        date,
        approveDate: null,
        approveTime: null,
        status: 0
      });

      return newWithdrawRequest;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async searchWithdrawRequests(criteria, page) {
    const itemsPerPage = 10;
    const offset = (page - 1) * itemsPerPage;

    let query = `
    SELECT wr.id, wr.userId, wr.amount, wr.toAccount, wr.date, wr.approveDate, wr.toAccount, wr.reason,
           wr.approveTime, wr.status, CONCAT(u.firstName, ' ', u.lastName) AS userName, u.mobile AS userNumber, 
           u.balance AS userBalance, bd.bankHoldersName AS bankHolderName, bd.accountNumber AS accountNumber, 
           bd.ifsc AS Ifsc, bd.upi AS Upi, bd.bankName AS BankName,
           CASE 
               WHEN wr.status = '0' THEN 'Pending'
               WHEN wr.status = '1' THEN 'Accept'
               WHEN wr.status = '-1' THEN 'Reject'
               ELSE 'unknown'
           END AS status
    FROM withdraw_requests AS wr
    JOIN users AS u ON wr.userId = u.id
    LEFT JOIN bankDetails AS bd ON wr.userId = bd.userId
    `;

    const queryParams = [];
    const whereConditions = [];

    if (criteria.userId) {
      whereConditions.push("wr.userId = ?");
      queryParams.push(criteria.userId);
    }
    if (criteria.name) {
      whereConditions.push("(u.firstName LIKE ? OR u.lastName LIKE ?)");
      let searchParam = `%${criteria.name}%`;
      queryParams.push(searchParam);
      queryParams.push(searchParam);
  }  
    if (criteria.date) {
      whereConditions.push("wr.date LIKE ?");
      queryParams.push(`%${criteria.date}%`);
    }
    if (criteria.amount) {
      const changeAmount = String(criteria.amount);
      whereConditions.push("wr.amount LIKE ?");
      queryParams.push(`%${changeAmount}%`);
    }
    if (criteria.approvedDate) {
      whereConditions.push("wr.approveDate LIKE ?");
      queryParams.push(`%${criteria.approvedDate}%`);
    }
    if (criteria.approvedTime) {
      whereConditions.push("wr.approveTime LIKE ?");
      queryParams.push(`%${criteria.approvedTime}%`);
    }
    if (criteria.mobile) {
      whereConditions.push("u.mobile LIKE ?");
      queryParams.push(`%${criteria.mobile}%`);
    }
    if (criteria.balance) {
      const changeBalance = String(criteria.balance);
      whereConditions.push("u.balance LIKE ?");
      queryParams.push(`%${changeBalance}%`);
    }
    if (criteria.toAccount) {
      whereConditions.push("wr.toAccount LIKE ?");
      queryParams.push(`%${criteria.toAccount}%`);
    }
    if(criteria.reason){
        whereConditions.push("wr.reason LIKE ?");
        queryParams.push(`%${criteria.reason}%`);
    }
    if (criteria.status) {
      let statusValue;
      if (criteria.status === "Pending") {
        statusValue = "0";
      } else if (criteria.status === "Accept") {
        statusValue = "1";
      } else if (criteria.status === "Reject") {
        statusValue = "-1";
      }
      if (statusValue !== undefined) {
        whereConditions.push("wr.status = ?");
        queryParams.push(statusValue);
      }
    }

    if (whereConditions.length > 0) {
      query += " WHERE " + whereConditions.join(" AND ");
    }

    let countQuery = `
    SELECT COUNT(*) AS totalCount
    FROM withdraw_requests AS wr
    JOIN users AS u ON wr.userId = u.id
    LEFT JOIN bankDetails AS bd ON wr.userId = bd.userId
    `;
    if (whereConditions.length > 0) {
      countQuery += " WHERE " + whereConditions.join(" AND ");
    }

    try {
      const [rows] = await pool.execute(
        query + " ORDER BY wr.Id DESC LIMIT ? OFFSET ?",
        [...queryParams, itemsPerPage, offset]
      );

      const [countRows] = await pool.execute(countQuery, queryParams);

      return {
        status: true,
        msg: "Withdraw requests fetched successfully",
        totalPages: Math.ceil(countRows[0].totalCount / itemsPerPage),
        currentPage: page,
        data: rows,
      };
    } catch (error) {
      console.error("Error searching withdraw requests:", error);
      throw error;
    }
  }

  static async getWithdrawRequestsByUserId(userId) {
    const query = `SELECT 
    wr.userId,
    wr.amount,
    wr.toAccount,
    wr.date,
    wr.approveDate,
    wr.approveTime,
    CASE
        WHEN wr.status = '0' THEN 'Pending'
        WHEN wr.status = '1' THEN 'Accepted'
        WHEN wr.status = '-1' THEN 'Rejected'
        ELSE 'Unknown' -- Handle any other status values if necessary
    END AS status,
    CONCAT(u.firstName, ' ', u.lastName) AS userName,
    u.mobile AS userNumber,
    u.balance AS userBalance,
    IFNULL(
        JSON_OBJECT(
            'bankHoldersName', b.bankHoldersName,
            'bankName', b.bankName,
            'accountNumber', b.accountNumber,
            'ifsc', b.ifsc,
            'upi', b.upi
        ),
        JSON_OBJECT()
    ) AS bank
FROM 
    withdraw_requests AS wr
JOIN 
    users AS u ON wr.userId = u.id
LEFT JOIN
  bankDetails AS b ON wr.userId = b.userId
WHERE
    wr.userId = ?
ORDER BY
    wr.id DESC
`;
    try {
      const [result] = await pool.execute(query, [userId]);
      return result;
    } catch (error) {
      console.error("Error fetching withdraw requests by user ID:", error);
      throw error;
    }
  }

  static async deleteWithdrawRequest(requestId) {
    const query = "DELETE FROM withdraw_requests WHERE id = ?";
    try {
      const [result] = await pool.execute(query, [requestId]);
      return result.length ? new WithdrawRequest(result[0]) : null;
    } catch (error) {
      console.error("Error deleting withdraw request:", error);
      throw error;
    }
  }

  static async updateWithdrawRequestStatus(
    requestId,
    status,
    approveDate,
    approveTime,
    reason
  ) {
    const query = `
        UPDATE withdraw_requests 
        SET status = ?, approveDate = ?, approveTime = ?, reason = ?
        WHERE Id = ?;
    `;
    try {
      await pool.execute(query, [
        status,
        approveDate,
        approveTime,
        reason||null,
        requestId,
      ]);

      if (status === "-1") {
        const withdrawQuery = `
                SELECT userId, amount FROM withdraw_requests WHERE Id = ?;
            `;
        const [withdrawResult] = await pool.execute(withdrawQuery, [requestId]);
        if (withdrawResult.length > 0) {
          const userId = withdrawResult[0].userId;
          const amount = withdrawResult[0].amount;

          const updateUserBalanceQuery = `
                    UPDATE users SET balance = balance + ? WHERE id = ?;
                `;
          await pool.execute(updateUserBalanceQuery, [
            Math.abs(amount),
            userId,
          ]);
        }
      }

      return true; 
    } catch (error) {
      console.error("Error updating withdraw request status:", error);
      throw error;
    }
  }

  static async getWithdrawRequestsById(requestId) {
    const query = "SELECT * FROM withdraw_requests WHERE id = ?";
    try {
      const [result] = await pool.execute(query, [requestId]);
      return result[0];
    } catch (error) {
      console.error("Error fetching withdraw request by ID:", error);
      throw error;
    }
  }


  static async getPendingWithdrawRequests(userId,date) {
    console.log(userId,date)
    const parts = date.split("-");
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    const query = `SELECT * FROM withdraw_requests WHERE userId = ? AND status = '0' AND DATE(date) = DATE(?);`;
    try {
      const [result] = await pool.execute(query, [userId,formattedDate]);
      return result;
    } catch (error) {
      console.error("Error fetching pending withdraw requests:", error);
      throw error;
    }
    
  }


  static async getAllWithdrawRequestsByDate(userId, date) {
    const parts = date.split("-");
    const formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    const query = `
        SELECT COUNT(*) AS count_requests
        FROM withdraw_requests
        WHERE userId = ? AND DATE(date) = DATE(?);
    `;
    try {
        const [result] = await pool.execute(query, [userId, formattedDate]);
        return result[0].count_requests;
    } catch (error) {
        console.error(error);
        throw error;
    }
}



}
module.exports = WithdrawRequest;