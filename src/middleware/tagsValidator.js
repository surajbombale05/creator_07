const { body } = require("express-validator");

const createRequestValidation = [
  body("tags").trim().notEmpty().withMessage("tags is required"),
  body("percentage").trim().notEmpty().withMessage("percentage is required"),
  
];

module.exports = {
    createRequestValidation
}