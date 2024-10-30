// server.js

require('dotenv').config(); // Load environment variables at the top

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const userService = require('./services/userService'); // Import userService

const app = express();

app.use(express.json());

// Configure session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key', // Use a secure secret in production
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
      sameSite: 'lax',
    },
  })
);

// Initialize Passport and restore authentication state, if any, from the session
app.use(passport.initialize());
app.use(passport.session());

// Passport session setup
passport.serializeUser((user, done) => {
  done(null, user.id); // Serialize the user ID to the session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await userService.getUserById(id);
    done(null, user); // Deserialize the user from the session
  } catch (error) {
    done(error, null);
  }
});

// Configure the Google strategy for use by Passport
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID, // Your Google client ID
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Your Google client secret
      callbackURL: '/auth/google/callback', // Callback URL after authentication
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Attempt to find the user in the database
        let user = await userService.findUserByGoogleId(profile.id);

        if (!user) {
          // Create a new user if one doesn't exist
          user = await userService.createUser({
            googleId: profile.id,
            name: profile.displayName,
            email: profile.emails[0].value,
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
app.get(
  '/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/dashboard'); // Redirect to dashboard on successful login
  }
);

// Logout route
app.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    res.redirect('/');
  });
});

// Protected route example (Dashboard)
app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.send(`Welcome, ${req.user.name}!`);
});

// Import and use your routes
const userRoutes = require('./routes/userRoutes');
const riderRoutes = require('./routes/riderRoutes');
const driverRoutes = require('./routes/driverRoutes');
const tripRoutes = require('./routes/tripRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const rideRoutes = require('./routes/rideRoutes'); // Assuming you have ride routes

app.use('/users', userRoutes);
app.use('/riders', riderRoutes);
app.use('/drivers', driverRoutes);
app.use('/trips', tripRoutes);
app.use('/payments', paymentRoutes);
app.use('/rides', rideRoutes);

// Start the server and connect to the database
const PORT = process.env.PORT || 3000;

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
