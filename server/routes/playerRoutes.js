const express = require('express');
const router = express.Router();
const {
  searchPlayers,
  getPlayerInfo,
} = require('../controllers/playerController');

router.get('/search', searchPlayers);
router.get('/:id', getPlayerInfo);

module.exports = router;
