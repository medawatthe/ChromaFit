const path = require('path');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/env');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const wardrobeRoutes = require('./routes/wardrobeRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();

const LOCALHOST_ORIGIN = /^http:\/\/localhost:\d+$/;

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || origin === config.frontendOrigin || LOCALHOST_ORIGIN.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
}));
app.use(morgan('dev'));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/outfits', wardrobeRoutes);
app.use('/api/chat', chatRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found.' }));

app.use((err, req, res, next) => {
  console.error(err);
  if (err.message && err.message.includes('images are allowed')) {
    return res.status(400).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal server error.' });
});

module.exports = app;
