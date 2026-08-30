const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

// Fix DNS resolution issues (must run before connectDB)
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = require('./config/db');
const { protect } = require('./middleware/authMiddleware');
const {
  generalLimiter,
  authLimiter,
} = require('./middleware/rateLimitMiddleware');

const app = express();

connectDB();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(generalLimiter);

// ... rest stays the same