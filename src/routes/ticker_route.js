const express = require('express');
const router = express.Router();
const {
  createTicker,
  getTickers,
  getTickerById,
  updateTicker,
  deleteTicker
} = require('../controllers/ticker_controller');

router.post('/', createTicker);
router.post('/get-all', getTickers);
router.post('/:id', getTickerById);
router.put('/:id', updateTicker);
router.delete('/:id', deleteTicker);

module.exports = router;
