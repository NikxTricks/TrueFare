const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const http = require('http').createServer(app);
const io = require('./socket').init(http);
const prisma = new PrismaClient();
app.use(express.json());

const cors = require('cors');

app.use(cors({ origin: true, credentials: true }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user.userID));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { userID: id } });
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

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

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.redirect('/dashboard');
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
const driverRoutes = require('./routes/driverRoutes');
const tripRoutes = require('./routes/tripRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');

app.use('/api', riderRoutes);
app.use('/riders', riderRoutes);
app.use('/drivers', driverRoutes);
app.use('/trips', tripRoutes);
app.use('/payments', paymentRoutes);
app.use('/users', userRoutes);

const activeDrivers = {};

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);

  socket.on('startDrive', (data) => {
    const { driverID } = data;
    activeDrivers[driverID] = socket;
    console.log(`Driver ${driverID} started driving with socket ID ${socket.id}`);
  });

  socket.on('acceptRide', async (data) => {
    const { driverID, riderID, distance, pickupLocation, dropoffLocation, price } = data; // Expecting `price` field now
    const driverSocket = activeDrivers[driverID];
    const rider = await prisma.user.findUnique({
      where: { userID: riderID },
      select: { name: true }, // Only fetch the name field
    });
    const riderName = rider.name;

    if (driverSocket) {
      console.log(`Notifying driver ${driverID} of ride acceptance with details`);
  
      driverSocket.emit('rideAcceptedNotification', {
        riderID,
        riderName,
        distance,
        pickupLocation,
        dropoffLocation,
        price, // Include price in the notification payload
      });
    } else {
      console.log(`Driver ${driverID} not found or not online`);
    }
  });
  


  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
    for (const driverID in activeDrivers) {
      if (activeDrivers[driverID].id === socket.id) {
        delete activeDrivers[driverID];
        console.log(`Removed driver ${driverID} from active drivers`);
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('Database connected!');
  } catch (error) {
    console.error('Unable to connect to the database:', error.message);
    console.log('Continuing without database connection...');
  }

  http.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
