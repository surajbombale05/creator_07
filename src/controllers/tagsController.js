const Tags = require('../models/tagsModel');
const { validationResult } = require('express-validator');
const {formatTimeToIST} = require('../../utils/dateUtils');
const {getGoogleSuggestions} = require('../../utils/imlementTagsApi')


exports.createTags = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({ errors: errorMessages });
    }
      
    const {tags,percentage} = req.body;
    const date = formatTimeToIST().format('DD-MM-YYYY');
    try {
      const newTags = await Tags.create({
        tags,
        percentage,
        date
      });
  
      return res.status(200).json({ message: 'Tags Data', data: newTags });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  exports.findTagsByTag = async (req, res) => {
    const { tag } = req.body;
    try {
        const tags = await getGoogleSuggestions(tag);
        const transformedData = tags.map((tag, index) => {
          return {
            id: index + 1,
            tag: tag
          };
        });
        
        return res.status(200).json({ message: 'Tags Found', data: transformedData });
    } catch (error) {
        console.error(error);
        return res.status(407).json({ errors: ["Something went wrong"] });
    }
};
