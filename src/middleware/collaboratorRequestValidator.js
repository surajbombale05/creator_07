const { body } = require("express-validator");

const createCollaboratorRequestValidation = [
  body("userId").trim().notEmpty().withMessage("userId is required"),
  body("collaboratorId").trim().notEmpty().withMessage("creatorId is required"),
  body("description").trim().notEmpty().withMessage("Description is required")
];



module.exports = {
    createCollaboratorRequestValidation
}