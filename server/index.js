const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cricket_platform';
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Socket.io for Real-time Updates
const { initSocketUpdates } = require('./services/socketService');
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});
initSocketUpdates(io);

// Pass io to routes if needed
app.set('io', io);

// Routes
const matchRoutes = require('./routes/matchRoutes');
const playerRoutes = require('./routes/playerRoutes');
const searchRoutes = require('./routes/searchRoutes');

app.use('/api/matches', matchRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/search', searchRoutes);

// Welcome Route
app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Welcome to CricZone 360 API',
    endpoints: {
      matches: '/api/matches',
      players: '/api/players',
      search: '/api/search'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'success',
    server: 'ok',
    cricketApiKeyConfigured: Boolean(process.env.CRIC_API_KEY),
    mongoState: mongoose.connection.readyState,
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
