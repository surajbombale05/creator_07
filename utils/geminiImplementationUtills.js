const axios = require('axios');
require('dotenv').config();
async function generateContent(userText) {
    try {
        const requestData = {
            contents: [
                {
                    parts: [
                        {
                            text: userText
                        }
                    ]
                }
            ]
        };
       console.log()
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.Gemini_Api_Key}`;
      
        const response = await axios.post(apiUrl, requestData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.data && response.data.candidates && response.data.candidates.length > 0) {
            return response.data.candidates[0].content.parts;
        } else {

        console.log('API Error:', error.response?.status, error.response?.data);
        console.log('No candidates found in the response.');
        return null;
        }
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}

module.exports = {generateContent};
