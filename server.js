const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
require('dotenv').config();

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

app.use('/api/auth', authLimiter, require('./routes/authRoutes'));
app.use('/api/offices', require('./routes/officeRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/cases', require('./routes/caseRoutes'));
app.use('/api/documents', require('./routes/documentRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/access-grants', require('./routes/accessGrantRoutes'));

app.use(
  '/logos',
  express.static(path.join(__dirname, 'uploads', 'logos'))
);

app.use('/api/profile', require('./routes/profileRoutes'));
app.use('/api/audit-logs', require('./routes/auditRoutes'));

app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

app.get('/api/protected-test', protect, (req, res) => {
  res.json({
    message: 'You are authenticated!',
    user: req.user,
  });
});

const PORT = process.env.PORT || 5000;

// Local development only
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;