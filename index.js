const express = require('express');
const dotenv = require('dotenv');
const rideRoutes = require('./routes/rideRoutes');
const driverRoutes = require('./routes/driverRoutes');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use('/api/rides', rideRoutes);
app.use('/api/driver', driverRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
