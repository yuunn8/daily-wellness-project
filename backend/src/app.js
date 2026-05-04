const express = require('express');
const cors = require('cors');
const path = require('path');
const env = require('./config/env');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const missionRoutes = require('./routes/mission.routes');
const postRoutes = require('./routes/post.routes');

const notFoundMiddleware = require('./middleware/not-found.middleware');
const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (req, res) => {
  res.json({ message: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/posts', postRoutes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = app;