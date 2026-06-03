const asyncHandler = require('express-async-handler');
const cricketApi = require('../services/cricketApi');

const quotaExceeded = (payload) => {
  const info = payload?.info;
  return info && Number(info.credits) <= 0 && Number(info.hitsToday) >= Number(info.hitsLimit);
};

const sendProviderData = (res, payload, fallback) => {
  if (quotaExceeded(payload)) {
    return res.status(429).json({
      status: 'error',
      message: `Cricket API quota exceeded. Used ${payload.info.hitsToday}/${payload.info.hitsLimit} requests today and credits are ${payload.info.credits}.`,
      info: payload.info,
    });
  }

  return res.json({
    status: 'success',
    data: payload.data || fallback,
    info: payload.info || {},
  });
};

/**
 * @desc    Search players
 * @route   GET /api/players/search
 * @access  Public
 */
const searchPlayers = asyncHandler(async (req, res) => {
  const { name } = req.query;
  if (!name) {
    return res.status(400).json({ status: 'error', message: 'Player name is required' });
  }
  const players = await cricketApi.searchPlayers(name);
  sendProviderData(res, players, []);
});

/**
 * @desc    Get player info
 * @route   GET /api/players/:id
 * @access  Public
 */
const getPlayerInfo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const playerInfo = await cricketApi.getPlayerInfo(id);
  sendProviderData(res, playerInfo, playerInfo);
});

module.exports = {
  searchPlayers,
  getPlayerInfo,
};
