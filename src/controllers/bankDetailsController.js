const BankDetails = require("../models/bankDetailsModel");
const { validationResult } = require("express-validator");
const User = require("../models/userModel");

exports.createBankDetails = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }

  const { bankName, accountNumber, ifsc, bankHoldersName, userId, upi } = req.body;
  try {
    const findUser = await User.findUserById(userId);
    if (!findUser) {
      return res.status(404).json({ status: false, errors: ["User not found"] });
    }

    let bankDetails = await BankDetails.findOneByUserId(userId);
    if (!bankDetails) {
      bankDetails = await BankDetails.create({
        bankName,
        accountNumber,
        ifsc,
        bankHoldersName,
        userId,
        upi
      });
      return res.status(200).json({
        status: true,
        msg: "Bank details created successfully",
        data: bankDetails,
      });
    } else {
      bankDetails = await BankDetails.updateBankDetailsByUserId(userId, {
        bankName,
        accountNumber,
        ifsc,
        bankHoldersName,
        upi
      })

      bankDetails = await BankDetails.findOneByUserId(userId);
      return res.status(200).json({
        status: true,
        msg: "Bank details updated successfully",
        data: bankDetails,
      });
    }
  } catch (error) {
    res.status(407).json({ errors: ["Something went wrong"] });
  }
};


exports.getBankDetailsByUserId = async (req, res) => {
  const {userId} = req.body;
  try {
    const bankDetails = await BankDetails.findOneByUserId(userId);
    if(!bankDetails) {
      return res.status(404).json({ status: false, errors: ['Add bank details'], data:[] });
    }
    return res.status(200).json({
      status: true,
      msg: 'Bank details fetched successfully',
      data: bankDetails,
    });
  } catch (error) {
    console.error(error);
    res.status(407).json({ errors: ["Something went wrong"] });
  }
};


exports.updateBankDetails = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((error) => error.msg);
    return res.status(400).json({ errors: errorMessages });
  }
  const userId = req.params.id
  const { Name, accountNo, IFSC, Phonepe, GooglePay, Paytm, UPI } = req.body;
  try {
    if (accountNo) {
      const findAccountNumber = await BankDetails.findOneByAccountNo(accountNo);
      if (findAccountNumber) {
        return res
          .status(400)
          .json({ status: false, error: "Account number already exists" });
      }
    }
    const bankDetails = await BankDetails.updateBankDetailsByUserId(userId, {
      Name,
      accountNo,
      IFSC,
      Phonepe,
      GooglePay,
      Paytm,
      UPI,
    });
    const findBankDeatils = await BankDetails.findOneByUserId(userId);
    console.log(findBankDeatils);
    return res
      .status(200)
      .json({
        status: true,
        msg: "Bank details updated successfully",
        data: findBankDeatils,
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};