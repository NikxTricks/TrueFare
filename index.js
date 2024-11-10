const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const prisma = new PrismaClient();
const io = require('./socket').init(server);  // Initialize Socket.io once with HTTP server

app.use(express.json());
const cors = require('cors');
app.use(cors({ origin: true, credentials: true }));

// Middleware configuration for sessions and Passport
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Routes
const riderRoutes = require('./routes/riderRoutes');
const driverRoutes = require('./routes/driverRoutes');
const tripRoutes = require('./routes/tripRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/riders', riderRoutes);
app.use('/drivers', driverRoutes);
app.use('/trips', tripRoutes);
app.use('/payments', paymentRoutes);
app.use('/users', userRoutes);

// WebSocket Events
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  socket.on('joinDriverRoom', (data) => {
    socket.join(`driver_${data.driverID}`);
  });
  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Database and server startup
const PORT = process.env.PORT || 3000;
async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database connected!');
  } catch (error) {
    console.error('Database connection error:', error.message);
  }
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
