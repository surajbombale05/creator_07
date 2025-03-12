const Ticker = require('../models/ticker_model');

const createTicker = async (req, res) => {
  try {
    const {link, title, background_color, text_color, link_color} = req.body;
    const id = await Ticker.createTicker({link, title, background_color, text_color, link_color});
    const data = ({ id,link, title, background_color, text_color, link_color });
    res.json({status : true , message :"Ticker created successfully.", data});
  } catch (error) {
    res.status(500).json({status:false, error: error.message });
  }
};

const getTickers = async (req, res) => {
  try {
    const tickers = await Ticker.getAllTickers();
    res.status(200).json({ status: true, message: "Get tickers Successfully.", tickers });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

const getTickerById = async (req, res) => {
  try {
    const { id } = req.params;
    const ticker = await Ticker.getTickerById(id);
    if (!ticker) return res.status(404).json({status:false, message: 'Ticker not found' });
    res.json({status:true , message:"Get ticker Successfully.",ticker});
  } catch (error) {
    res.status(500).json({status:false, error: error.message });
  }
};

const updateTicker = async (req, res) => {
  try {
    const { id } = req.params;
    const { link, title, background_color, text_color, link_color } = req.body;
    const success = await Ticker.updateTicker(id, { link, title, background_color, text_color, link_color });

    if (!success) return res.status(404).json({ status: false, message: 'Ticker not found' });

    res.json({ status: true, message: 'Ticker updated successfully' });
  } catch (error) {
    res.status(500).json({ status: false, error: error.message });
  }
};

const deleteTicker = async (req, res) => {
  try {
    const { id } = req.params;
    const success = await Ticker.deleteTicker(id);
    if (!success) return res.status(404).json({status:false, message: 'Ticker not found' });
    res.json({status:true, message: 'Ticker deleted successfully' });
  } catch (error) {
    res.status(500).json({status:false, error: error.message });
  }
};

module.exports = { createTicker, getTickers, getTickerById, updateTicker, deleteTicker };
