const pool = require("../../db");

class BankDetails {
  constructor({ id, bankName, accountNumber, ifsc, upi, userId, bankHoldersName }) {
    this.id = id;
    this.bankName = bankName;
    this.accountNumber = accountNumber;
    this.ifsc = ifsc;
    this.upi = upi;
    this.userId = userId;
    this.bankHoldersName = bankHoldersName;
  }

  static async create({ bankName, accountNumber, ifsc, upi, userId, bankHoldersName }) {
    const query = `
      INSERT INTO bankDetails (bankName, accountNumber, ifsc, upi, userId, bankHoldersName) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const values = [bankName||null, accountNumber||null, ifsc||null, upi||null, userId, bankHoldersName||null];
    try {
      const [result] = await pool.execute(query, values);
      if (result.affectedRows !== 1) {
        throw new Error("Bank details creation failed");
      }
      const newBankDetails = new BankDetails({
        id: result.insertId,
        bankName,
        accountNumber,
        ifsc,
        upi,
        userId,
        bankHoldersName
      });
      return newBankDetails;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findOneByUserId(userId) {
      const query = "SELECT * FROM bankDetails WHERE userId = ?;";
      try {
          const [result] = await pool.execute(query, [userId]);
          return result.length ? new BankDetails(result[0]) : null;
      }catch(error){
          console.error(error);
          throw error;
      }
  }

  static async findOneByAccountNo(accountNo) {
    const query = "SELECT * FROM bankdetails WHERE accountNumber = ?";
    try {
       const [result] = await pool.execute(query, [accountNo]);
       return result.length ? new BankDetails(result[0]) : null; 
    }catch(error){
        console.error(error);
        throw error;
    }
  }

  static async updateBankDetailsByUserId(userId, {
    bankName,
    accountNumber,
    ifsc,
    upi,
    bankHoldersName
}) {
    const updateFields = [];
    const updateValues = [];
    if (bankName !== undefined) {
        updateFields.push("bankName = ?");
        updateValues.push(bankName);
    }
    if (accountNumber !== undefined) {
        updateFields.push("accountNumber = ?");
        updateValues.push(accountNumber);
    }
    if (ifsc !== undefined) {
        updateFields.push("ifsc = ?");
        updateValues.push(ifsc);
    }
    if (upi !== undefined) {
        updateFields.push("upi = ?");
        updateValues.push(upi);
    }
    if (bankHoldersName !== undefined) {
        updateFields.push("bankHoldersName = ?");
        updateValues.push(bankHoldersName);
    }

    if (updateFields.length === 0) {
        return false; 
    }

    const query = `
        UPDATE bankDetails
        SET ${updateFields.join(", ")}
        WHERE userId = ?;
    `;
    try {
        const params = [...updateValues, userId];
        const [results] = await pool.execute(query, params);
        return results.affectedRows > 0 ? true : false;
    } catch (error) {
        console.error(error);
        throw error;
    }
}


}

module.exports = BankDetails;