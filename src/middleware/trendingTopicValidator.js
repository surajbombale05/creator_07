const { body } = require("express-validator");

const validTypeValues = ['banners', 'youtubeupdates', 'topics', 'trendingtopics'];
const isValidType = (value) => validTypeValues.includes(value);

const createTrendingTopicValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
    body("url").custom((url, { req }) => {
      if (url === undefined || url === null || url === '') {
        if (!req.body.description) {
          throw new Error("Description is required when URL is null");
        }
      }
      return true;
    }),
  ];
  
const updateClickCount = [
  body("userId").trim().notEmpty().withMessage("sserId is required"),
  body("commonId").trim().notEmpty().withMessage("commonId is required"),
  body("type")
    .trim()
    .notEmpty()
    .withMessage("Type is required")
    .custom(isValidType)
    .withMessage("Invalid type specified")

]
module.exports = {
    createTrendingTopicValidation,
    updateClickCount
}