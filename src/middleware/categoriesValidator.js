const { body } = require("express-validator");


const createCategory = [
    body("name").trim().notEmpty().withMessage("Name is required"),
];


module.exports = {
    createCategory
}