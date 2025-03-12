const Search = require('../models/searchModel');

exports.getAllSearch = async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword) {
          return res.status(400).json({ error: 'Keyword is required' });
        } 
      const services = await Search.search(keyword);
      return res.status(200).json({ msg: 'List Of All Search', data: services });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };