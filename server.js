const express = require('express');
const http = require('http');  // Needed for Socket.io
const socketio = require('socket.io');
require('dotenv').config(); 

const app = express();
const server = http.createServer(app);
const io = socketio(server);  // Initialize Socket.io with the server

// Middleware
app.use(express.json());

// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.on('join', ({ driverID }) => {
    socket.join(driverID);  // Each driver joins a room identified by their driverID
    console.log(`Driver ${driverID} joined room`);
  });
});

const customerRoutes = require('./routes/customer');
const driverRoutes = require('./routes/driverRoutes');
const paymentRoutes = require('./routes/payments');
const tripRoutes = require('./routes/trips');
const rideRoutes = require('./routes/rideRoutes');

app.use('/customers', customerRoutes);
app.use('/drivers', driverRoutes);
app.use('/payments', paymentRoutes);
app.use('/trips', tripRoutes);
app.use('/rides', rideRoutes);  

// Export the Socket.io instance for use in other modules (e.g., rideSender.js)
module.exports = io;

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));  // Use server.listen instead of app.listen for Socket.io support
