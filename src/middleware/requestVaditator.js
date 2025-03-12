const { body } = require("express-validator");

const createRequestValidation = [
  body("userId").trim().notEmpty().withMessage("userId is required"),
  body("creatorId").trim().notEmpty().withMessage("creatorId is required"),
  body("description").trim().notEmpty().withMessage("Description is required"),
  body("language").trim().notEmpty().withMessage("Language is required"),
  body("location").trim().notEmpty().withMessage("Location is required"),
  body("amount").isInt({ min: 0 }).withMessage("Amount must be a non-negative integer"),
  body("isThumbnail").isIn(['Yes', 'No']).withMessage("isThumbnail must be either 'Yes' or 'No'"),
  body("isEdited").isIn(['Yes', 'No']).withMessage("isEdited must be either 'Yes' or 'No'"),
];
const canRequestValidation = [
  body("userId").trim().notEmpty().withMessage("userId is required"),
  body("creatorId").trim().notEmpty().withMessage("creatorId is required"),
];



module.exports = {
    createRequestValidation,
    canRequestValidation
}