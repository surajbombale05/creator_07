const { body } = require("express-validator");

const createServiceValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
];


module.exports = {
  createServiceValidation,
};
