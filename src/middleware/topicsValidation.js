const { body } = require("express-validator");

const createTopicValidation = [
  body("topic").trim().notEmpty().withMessage("Topic is required"),
  // body("image_path").trim().notEmpty().withMessage("Image path is required"),
  body("url").custom((url, { req }) => {
    if (url === null) {
      if (!req.body.description) {
        throw new Error("Description is required when URL is null");
      }else {
        const validUrlPattern = /^(http:\/\/|https:\/\/)/;
        if (!validUrlPattern.test(url)) {
          throw new Error("Invalid URL format. Must start with 'http://' or 'https://'");
        }
      }  
    }
    return true;
  }),
  body('categoryId').notEmpty().withMessage('category Id is required'),
  body('subcategoryId').optional().trim().notEmpty().withMessage("subcategory Id is required"),
  body("image_path").optional().custom(checkImagePath),
];

const updateTopicValidation = [
  body("topic").optional().trim().notEmpty().withMessage("Topic is required"),
  // You can add more validations for other fields as needed
];

function checkImagePath(value, { req }) {
  if (req.files && req.files['image_path'] && req.files['image_path'][0]) {
    // Image path is selected, so it should not be empty
    if (!value) {
      throw new Error('Image path cannot be empty if selected');
    }
  }
  return true;
}


module.exports = {
  createTopicValidation,
  updateTopicValidation
};
