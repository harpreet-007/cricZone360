const express = require('express');
const router = express.Router();
const { globalSearch, searchMetadata } = require('../controllers/searchController');

router.get('/metadata', searchMetadata);
router.get('/', globalSearch);

module.exports = router;
