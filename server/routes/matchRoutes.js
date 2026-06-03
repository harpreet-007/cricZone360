const express = require('express');
const router = express.Router();
const {
  getMatches,
  getMatchInfo,
  getScorecard,
  getSeries,
} = require('../controllers/matchController');

router.get('/', getMatches);
router.get('/series', getSeries);
router.get('/:id', getMatchInfo);
router.get('/:id/scorecard', getScorecard);

module.exports = router;
