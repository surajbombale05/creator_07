const pool = require('../../db');

class userVerfication{
    constructor(
        id,
        userId,
        isVerified,
        verificationLink,
        verifiedOn,
        verifiedDate        
      ) {
        this.id = id;
        this.userId = userId;
        this.isVerified = isVerified;
        this.verificationLink = verificationLink;
        this.verifiedOn = verifiedOn;
        this.verifiedDate = verifiedDate
      }

      static async create({userId,isVerified,verificationLink,verifiedOn,verifiedDate}) {
        const query =
          "INSERT INTO UserVerification (userId,isVerified,verificationLink,verifiedOn,verifiedDate) VALUES (?, ?, ?, ?, ?);";
        const values = [userId,isVerified,verificationLink,verifiedOn,verifiedDate];
        try {
          const [result] = await pool.execute(query, values);
          const parsedResult = {
            id: result.id,
            userId: result.userId,
            isVerified: result.isVerified,
            verificationLink: result.verificationLink,
            verifiedOn: result.verifiedOn,
            verifiedDate: result.verifiedDate
          };
          return parsedResult;
        } catch (error) {
          console.error(error);
          throw error;
        }
      }


    static async findUserVerficationById(id) {
        console.log(id)
    const query = "SELECT * FROM UserVerification WHERE userId = ?;";
    const values = [id];
    try {
      const [result] = await pool.execute(query, values);
      return result.length ? result[0] : null;;
    } catch (error) {
      console.error(error);
      throw error;
    }
}


static async findAllUserVerification(){
    const query = `SELECT 
    us.*, 
    CONCAT(u.firstName, ' ', u.lastName) AS fullname,
    u.profile_image,
    CASE
         WHEN us.isVerified = '0' THEN 'pending'
         WHEN us.isVerified = '1' THEN 'accepted'
         WHEN us.isVerified = '-1' THEN 'rejected'
         ELSE 'unknown' -- Add this if you want to handle any other status values
       END AS isVerified
FROM UserVerification us
JOIN users u ON us.userId = u.id
ORDER BY us.id DESC;`;
    try {
      const [result] = await pool.execute(query);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
}

static async getChartOfUserVerification(){
    const query = `SELECT COUNT(*) AS totalVerified FROM UserVerification WHERE isVerified = '1' ;`;
    try {
      const [result] = await pool.execute(query);
      return result[0].totalVerified;
    } catch (error) {
      console.error(error);
      throw error;
    }

}



static async finduserVerificationByverificationId(id) {
    const query = "SELECT * FROM UserVerification WHERE id = ?;";
    const values = [id];
    try {
      const [result] = await pool.execute(query, values);
      return result.length ? result[0] : null;;
    } catch (error) {
      console.error(error);
      throw error;
    }
}


static async updateuserVerificationByverificationId(id,verfiication) {
    const query = `UPDATE UserVerification SET isVerified = ? WHERE id = ?;`;
    const values = [verfiication,id];
    try {
      const [result] = await pool.execute(query, values);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
}



}
module.exports = userVerfication