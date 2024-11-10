const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { PrismaClient } = require('@prisma/client'); // Prisma Client for database
require('dotenv').config(); // Load environment variables

const app = express();
const http = require('http').createServer(app); // Create HTTP server for Socket.io
const io = require('./socket').init(http); // Initialize Socket.io using socket.js
const prisma = new PrismaClient(); // Initialize Prisma client
app.use(express.json());

const cors = require('cors');

// Allow all origins
app.use(cors({ origin: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', // Use a secure secret in production
    resave: false,
    saveUninitialized: true,
  })
);


app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.userID)); // Use userID as identifier
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { userID: id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Configure Google OAuth strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: '/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

        if (!user) {
          user = await prisma.user.create({
            data: {
              googleId: profile.id,
              name: profile.displayName,
              email: profile.emails[0].value,
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Routes for Google OAuth authentication
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/dashboard'); // Redirect on successful login
});

app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.send(`Welcome, ${req.user.name}!`);
});

// Import routes
const riderRoutes = require('./routes/riderRoutes');
app.use('/api', riderRoutes); // Mounts routes at /api

const driverRoutes = require('./routes/driverRoutes');
const tripRoutes = require('./routes/tripRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');


// Use routes
app.use('/riders', riderRoutes);
app.use('/drivers', driverRoutes);
app.use('/trips', tripRoutes);
app.use('/payments', paymentRoutes);
app.use('/users', userRoutes);

// Socket.io configuration for WebSocket connections (driver/rider notifications)
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('joinDriverRoom', (data) => {
    console.log(`Driver ${data.driverID} has joined their room`);
    socket.join(`driver_${data.driverID}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start the server and attempt to connect to the database
const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect(); // Connect Prisma client to the database
    console.log('Database connected!');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    console.log('Continuing without database connection...');
  }

  // Start the server with HTTP server for WebSocket support
  http.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
