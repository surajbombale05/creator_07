const pool = require("../../db");

class Payment {
  constructor({
    payment_method,
    bankname,
    account_holder_name,
    account_number,
    ifsc_code,
    upi_id,
    active,
    interstitial_ad_details_key,
    banner_ad_details_key,
    native_ad_details_key,
    reward_details_ad_key,
    home_details_ad_key_2,
    home_details_ad_key_3,
    withdrawMinimumLimitAmount,
    minimum_withdraw_daily_limit,
    startTime,
    endTime,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    Sunday,
    createdAt,
    updatedAt,
    searchType,
    cashfree_X_Client_Secret,
    cashfree_X_Client_Id,
    upiId,
    razorpay_key,
    verificationVedioLink,
    verificationText,
    playstore_url,
    version,
    creator_native_id,
    dashboard_native_id,
    collab_native_id,
    home_native_id,
    term_and_cond,
    privacy_policy,
    about_us,
    phone_pay_key,
    razorpay_secret_key,
    razorpay_id,
  }) {
    this.payment_method = payment_method;
    this.bankname = bankname;
    this.account_holder_name = account_holder_name;
    this.account_number = account_number;
    this.ifsc_code = ifsc_code;
    this.upi_id = upi_id;
    this.active = active;
    this.interstitial_ad_details_key = interstitial_ad_details_key;
    this.banner_ad_details_key = banner_ad_details_key;
    this.native_ad_details_key = native_ad_details_key;
    this.reward_details_ad_key = reward_details_ad_key;
    this.home_details_ad_key_2 = home_details_ad_key_2;
    this.home_details_ad_key_3 = home_details_ad_key_3;
    this.withdrawMinimumLimitAmount = withdrawMinimumLimitAmount;
    this.minimum_withdraw_daily_limit = minimum_withdraw_daily_limit;
    this.startTime = startTime;
    this.endTime = endTime;
    this.Monday = Monday;
    this.Tuesday = Tuesday;
    this.Wednesday = Wednesday;
    this.Thursday = Thursday;
    this.Friday = Friday;
    this.Saturday = Saturday;
    this.Sunday = Sunday;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.searchType = searchType;
    this.cashfree_X_Client_Id = cashfree_X_Client_Id;
    this.cashfree_X_Client_Secret = cashfree_X_Client_Secret;
    this.upiId = upiId;
    this.razorpay_key = razorpay_key;
    this.verificationVedioLink = verificationVedioLink;
    this.verificationText = verificationText;
    this.playstore_url = playstore_url;
    this.version = version;
    this.creator_native_id = creator_native_id;
    this.dashboard_native_id = dashboard_native_id;
    this.collab_native_id = collab_native_id;
    this.home_native_id = home_native_id;
    this.term_and_cond = term_and_cond;
    this.privacy_policy = privacy_policy;
    this.about_us = about_us;
    this.phone_pay_key = phone_pay_key;
    this.razorpay_secret_key = razorpay_secret_key;
    this.razorpay_id = razorpay_id;
  }

  static async create({
    payment_method,
    bankname,
    account_holder_name,
    account_number,
    ifsc_code,
    upi_id,
    active,
    interstitial_ad_details_key,
    topic_ad_details_key,
    notification_ad_details_key,
    home_details_ad_key_1,
    home_details_ad_key_2,
    home_details_ad_key_3,
    orderId,
    payment_session_id,
    playstore_url,
    version,
    creator_native_id,
    dashboard_native_id,
    collab_native_id,
    home_native_id,
    term_and_cond,
    privacy_policy,
    about_us,
    phone_pay_key,
    razorpay_secret_key,
    razorpay_id,
  }) {
    const query =
      "INSERT INTO payments (payment_method, bankname, account_holder_name, account_number, ifsc_code, upi_id, active, interstitial_ad_details_key, topic_ad_details_key, notification_ad_details_key, home_details_ad_key_1, home_details_ad_key_2, home_details_ad_key_3, createdAt, updatedAt, orderId, payment_session_id,playstore_url,version,creator_native_id,dashboard_native_id,collab_native_id,home_native_id,term_and_cond,privacy_policy,about_us,phone_pay_key,razorpay_secret_key,razorpay_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?)";
    const values = [
      payment_method,
      bankname,
      account_holder_name,
      account_number,
      ifsc_code,
      upi_id,
      active,
      interstitial_ad_details_key || null,
      topic_ad_details_key || null,
      notification_ad_details_key || null,
      home_details_ad_key_1 || null,
      home_details_ad_key_2 || null,
      home_details_ad_key_3 || null,
      orderId || null,
      payment_session_id || null,
      playstore_url || null,
      version || null,
      creator_native_id || null,
      dashboard_native_id || null,
      collab_native_id || null,
      home_native_id || null,
      term_and_cond || null,
      privacy_policy || null,
      about_us || null,
      phone_pay_key || null,
      razorpay_secret_key || null,
      razorpay_id || null,
    ];
    try {
      const [result] = await pool.execute(query, values);

      if (result.affectedRows !== 1) {
        throw new Error("Payment creation failed");
      }

      const newPayment = new Payment({
        id: result.insertId,
        payment_method,
        bankname,
        account_holder_name,
        account_number,
        ifsc_code,
        upi_id,
        active,
        interstitial_ad_details_key,
        topic_ad_details_key,
        notification_ad_details_key,
        home_details_ad_key_1,
        home_details_ad_key_2,
        home_details_ad_key_3,
        orderId,
        payment_session_id,
        playstore_url,
        version,
        creator_native_id,
        dashboard_native_id,
        collab_native_id,
        home_native_id,
        term_and_cond,
        privacy_policy,
        about_us,
        phone_pay_key,
        razorpay_secret_key,
        razorpay_id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return newPayment;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findPaymentById(paymentId) {
    const query = "SELECT * FROM payments WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [paymentId]);
      return results.length ? results[0] : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findAllPayments() {
    const query = "SELECT * FROM payments";

    try {
      const [result] = await pool.execute(query);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async deletePayment(paymentId) {
    const query = "DELETE FROM payments WHERE id = ?";

    try {
      const [results] = await pool.execute(query, [paymentId]);
      return results.affectedRows > 0;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findPaymentByAccountNumber(account_number) {
    const query = "SELECT * FROM payments WHERE account_number = ?";
    try {
      const [results] = await pool.execute(query, [account_number]);
      return results.length ? results[0] : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async findPaymentByUserId(userId) {
    const query = "SELECT * FROM payments WHERE userId = ?";
    try {
      const [results] = await pool.execute(query, [userId]);
      return results.length ? results[0] : null;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updatePayment(paymentId, {
    payment_method,
    bankname,
    account_holder_name,
    account_number,
    ifsc_code,
    upi_id,
    active,
    interstitial_ad_details_key,
    banner_ad_details_key,
    native_ad_details_key,
    reward_details_ad_key,
    home_details_ad_key_2,
    home_details_ad_key_3,
    playstore_url,
    version,
    creator_native_id,
    dashboard_native_id,
    collab_native_id,
    home_native_id,
    term_and_cond,
    privacy_policy,
    about_us,
    phone_pay_key,
    razorpay_secret_key,
    razorpay_id,
  }) {
    const updateFields = [];
    const updateValues = [];

    const pushField = (field, value) => {
      if (value !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(value === "" ? null : value);
      }
    };

    pushField("payment_method", payment_method);
    pushField("bankname", bankname);
    pushField("account_holder_name", account_holder_name);
    pushField("account_number", account_number);
    pushField("ifsc_code", ifsc_code);
    pushField("upi_id", upi_id);
    pushField("active", active);
    pushField("interstitial_ad_details_key", interstitial_ad_details_key);
    pushField("banner_ad_details_key", banner_ad_details_key);
    pushField("native_ad_details_key", native_ad_details_key);
    pushField("reward_details_ad_key", reward_details_ad_key);
    pushField("home_details_ad_key_2", home_details_ad_key_2);
    pushField("home_details_ad_key_3", home_details_ad_key_3);
    pushField("playstore_url", playstore_url);
    pushField("version", version);
    pushField("creator_native_id", creator_native_id);
    pushField("dashboard_native_id", dashboard_native_id);
    pushField("collab_native_id", collab_native_id);
    pushField("home_native_id", home_native_id);
    pushField("term_and_cond", term_and_cond);
    pushField("privacy_policy", privacy_policy);
    pushField("about_us", about_us);
    pushField("phone_pay_key", phone_pay_key);
    pushField("razorpay_secret_key", razorpay_secret_key);
    pushField("razorpay_id", razorpay_id);

    if (updateFields.length === 0) {
      return false; // No fields to update
    }

    const query = `
        UPDATE payments
        SET ${updateFields.join(", ")}
        WHERE id = ?;
    `;
    try {
      const params = [...updateValues, paymentId];
      const [results] = await pool.execute(query, params);
      return results.affectedRows > 0 ? true : false;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateGoogleAdds(paymentId, {
    interstitial_ad_details_key,
    banner_ad_details_key,
    native_ad_details_key,
    reward_details_ad_key,
    playstore_url,
    version,
    creator_native_id,
    dashboard_native_id,
    collab_native_id,
    home_native_id,
    term_and_cond,
    privacy_policy,
    about_us,
    phone_pay_key,
    razorpay_secret_key,
    razorpay_id,
  }) {
    const updateFields = [];
    const updateValues = [];

    const pushField = (field, value) => {
      if (value !== undefined) {
        updateFields.push(`${field} = ?`);
        updateValues.push(value === "" ? null : value);
      }
    };

    pushField("interstitial_ad_details_key", interstitial_ad_details_key);
    pushField("banner_ad_details_key", banner_ad_details_key);
    pushField("native_ad_details_key", native_ad_details_key);
    pushField("reward_details_ad_key", reward_details_ad_key);
    pushField("playstore_url", playstore_url);
    pushField("version", version);
    pushField("creator_native_id", creator_native_id);
    pushField("dashboard_native_id", dashboard_native_id);
    pushField("collab_native_id", collab_native_id);
    pushField("home_native_id", home_native_id);
    pushField("term_and_cond", term_and_cond);
    pushField("privacy_policy", privacy_policy);
    pushField("about_us", about_us);
    pushField("phone_pay_key", phone_pay_key);
    pushField("razorpay_secret_key", razorpay_secret_key);
    pushField("razorpay_id", razorpay_id);

    if (updateFields.length === 0) {
      return false;
    }

    const query = `
    UPDATE payments
    SET ${updateFields.join(", ")}
    WHERE id = ?;
  `;

    const params = [...updateValues, paymentId];

    try {
      const [results] = await pool.execute(query, params);
      return results.affectedRows > 0 ? true : false;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  static async getGoogleAdds() {
    const query = "SELECT interstitial_ad_details_key, banner_ad_details_key, native_ad_details_key, reward_details_ad_key FROM payments";
    try {
      const [results] = await pool.execute(query);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updateMinimumLimitAmount(paymentId, {
    withdrawMinimumLimitAmount,
    minimum_withdraw_daily_limit,
    startTime,
    endTime,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
    Sunday,
    searchType,
    verificationText,
    verificationVedioLink
  }) {
    const updateFields = [];
    const updateValues = [];
    if (withdrawMinimumLimitAmount !== undefined) {
      updateFields.push("withdrawMinimumLimitAmount = ?");
      updateValues.push(withdrawMinimumLimitAmount);
    }
    if (minimum_withdraw_daily_limit !== undefined) {
      updateFields.push("minimum_withdraw_daily_limit = ?");
      updateValues.push(minimum_withdraw_daily_limit);
    }
    if (startTime !== undefined) {
      updateFields.push("startTime = ?");
      updateValues.push(startTime);
    }
    if (endTime !== undefined) {
      updateFields.push("endTime = ?");
      updateValues.push(endTime);
    }
    if (Monday !== undefined) {
      updateFields.push("Monday = ?");
      updateValues.push(Monday);
    }
    if (Tuesday !== undefined) {
      updateFields.push("Tuesday = ?");
      updateValues.push(Tuesday);
    }
    if (Wednesday !== undefined) {
      updateFields.push("Wednesday = ?");
      updateValues.push(Wednesday);
    }
    if (Thursday !== undefined) {
      updateFields.push("Thursday = ?");
      updateValues.push(Thursday);
    }
    if (Friday !== undefined) {
      updateFields.push("Friday = ?");
      updateValues.push(Friday);
    }
    if (Saturday !== undefined) {
      updateFields.push("Saturday = ?");
      updateValues.push(Saturday);
    }
    if (Sunday !== undefined) {
      updateFields.push("Sunday = ?");
      updateValues.push(Sunday);
    }
    if (searchType !== undefined) {
      updateFields.push("searchType = ?");
      updateValues.push(searchType);
    }
    if (verificationText !== undefined) {
      updateFields.push("verificationText = ?");
      updateValues.push(verificationText);
    }
    if (verificationVedioLink !== undefined) {
      updateFields.push("verificationVedioLink = ?");
      updateValues.push(verificationVedioLink);
    }
    if (updateFields.length === 0) {
      return false;
    }

    const query = `
    UPDATE payments
    SET ${updateFields.join(", ")}
    WHERE id = ?;
  `;
    try {
      const params = [...updateValues, paymentId];
      const [results] = await pool.execute(query, params);
      return results.affectedRows > 0 ? true : false;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  static async updatePaymentOptions(type, cashfree_X_Client_Secret, cashfree_X_Client_Id, upiId, razorpay_key) {
    let query;
    let value;
    if (type === "cashfree") {
      query = "UPDATE payments SET cashfree_X_Client_Secret = ?, cashfree_X_Client_Id = ?, payment_method = 'cashfree' WHERE id = ?";
      value = [cashfree_X_Client_Secret, cashfree_X_Client_Id, 1];
    }
    if (type === "upi") {
      query = "UPDATE payments SET upiId = ?, payment_method = 'upi_id' WHERE id = ?";
      value = [upiId, 1];
    }
    if (type === "razorpay") {
      query = "UPDATE payments SET razorpay_key = ?, payment_method = 'razorpay' WHERE id = ?";
      value = [razorpay_key, 1];
    }
    try {
      const [results] = await pool.execute(query, value);
      return results.affectedRows > 0 ? true : false;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }


  static async getVerficationDetails() {
    const query = `SELECT verificationVedioLink, verificationText FROM payments`;
    try {
      const [results] = await pool.execute(query);
      return results;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

}

module.exports = Payment;
