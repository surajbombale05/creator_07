const axios = require('axios');
require('dotenv').config();

async function fetchCompletion(query) {
  const apiKey = process.env.GPT_API_KEY; 
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  const requestData = {
    model: "gpt-3.5-turbo",
    messages: [{ role: "user", content: query }],
    temperature: 0.7
  };

  try {
    const response = await axios.post(apiUrl, requestData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error fetching completion:', error);
    return error.response;
  }
}


module.exports = {
    fetchCompletion
}

