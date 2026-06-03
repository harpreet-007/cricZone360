const cricketApi = require('./cricketApi');

const initSocketUpdates = (io) => {
  // Update live scores every 30 seconds
  setInterval(async () => {
    try {
      console.log('[Socket] Fetching live updates...');
      const matches = await cricketApi.getMatches();
      const liveMatches = (Array.isArray(matches.data) ? matches.data : [])
        .filter(m => m.matchStarted && !m.matchEnded);
      
      liveMatches.forEach(match => {
        io.emit('matchUpdate', match);
      });
    } catch (error) {
      console.error('[Socket] Update error:', error.message);
    }
  }, 30000); // 30 seconds
};

module.exports = { initSocketUpdates };
