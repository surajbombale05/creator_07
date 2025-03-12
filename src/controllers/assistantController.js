const OpenAI = require('../models/assistantModel');
const User = require('../models/userModel');
const { validationResult } = require('express-validator');
const moment = require('moment-timezone');
const {generateContent} = require("../../utils/geminiImplementationUtills");
const {fetchCompletion} = require('../../utils/gptImplementation')
const {formatTimeToIST} = require('../../utils/dateUtils')
const path = require('path');
const Payment = require('../models/paymentModel');

exports.createAssistantResponse = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({ errors: errorMessages });
      }

    const { userId, type, message } = req.body;
    try {
        const dateString = formatTimeToIST().format('DD-MM-YYYY');
        const user = await User.findUserById(userId);
        if(!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const getPaymentData = await Payment.findAllPayments();
        if(getPaymentData[0].searchType === 'gemini'){
        const newOpenAiData = await OpenAI.create({ userId, type, message, date: dateString });
        const getMessageResponse = await generateContent(message);
        const data = getMessageResponse[0].text;
        const newAssistantData = await OpenAI.create({ userId, type: 'bot', message: data, date: dateString });
        }else if(getPaymentData[0].searchType === 'gpt'){
        const newOpenAiData = await OpenAI.create({ userId, type, message, date: dateString });
        const fetchGptResposne = await fetchCompletion(message);
        const gptData = fetchGptResposne.choices[0].message.content;
        const newAssistantData = await OpenAI.create({ userId, type: 'bot', message: gptData, date: dateString });
        }
        return res.status(201).json({ message: 'OpenAI data created successfully'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


exports.getChatResponseByUserId = async (req, res) => {
    const userId = req.params.id;
    try{
        const response = await OpenAI.findOpenAiDataByUserId(userId);
        return res.status(200).json({ msg: 'OpenAI data', data: response });
    }catch(error){
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

