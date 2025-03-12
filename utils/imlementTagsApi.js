const axios = require('axios');

async function getGoogleSuggestions(query) {
    try {
      const response = await axios.get(`http://suggestqueries.google.com/complete/search?client=youtube&ds=yt&client=firefox&q=${query}`);
      if(response.status === 200) {
          const suggestions = response.data[1];
          return suggestions;
      }
    } catch (error) {
      console.error('Error fetching Google suggestions:', error);
      return error.response.data;
    }
  }

module.exports = { getGoogleSuggestions }