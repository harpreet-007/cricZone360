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
 * @desc    Get live and upcoming matches
 * @route   GET /api/matches
 * @access  Public
 */
const getMatches = asyncHandler(async (req, res) => {
  const matches = await cricketApi.getMatches({ feed: req.query.feed, tournament: req.query.tournament });
  sendProviderData(res, matches, []);
});

/**
 * @desc    Get match info
 * @route   GET /api/matches/:id
 * @access  Public
 */
const getMatchInfo = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const matchInfo = await cricketApi.getMatchInfo(id);
  sendProviderData(res, matchInfo, matchInfo);
});

/**
 * @desc    Get match scorecard
 * @route   GET /api/matches/:id/scorecard
 * @access  Public
 */
const getScorecard = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const scorecard = await cricketApi.getScorecard(id);
  sendProviderData(res, scorecard, scorecard);
});

/**
 * @desc    Get series list
 * @route   GET /api/matches/series
 * @access  Public
 */
const getSeries = asyncHandler(async (req, res) => {
  const { offset } = req.query;
  const series = await cricketApi.getSeries(offset);
  sendProviderData(res, series, []);
});

module.exports = {
  getMatches,
  getMatchInfo,
  getScorecard,
  getSeries,
};
