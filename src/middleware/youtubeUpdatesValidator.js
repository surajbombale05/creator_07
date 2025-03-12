const { body } = require("express-validator");

const createYoutubeUpdatesValidation = [
    body("url").custom((url, { req }) => {
      if (url === undefined || url === null || url === '') {
        if (!req.body.title) {
          throw new Error("Title is required when URL is null");
        }
        if (!req.body.description) {
          throw new Error("Description is required when URL is null");
        }
      }
      return true;
    }),
  ];
  

module.exports = {
    createYoutubeUpdatesValidation
}