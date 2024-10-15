const express = require('express');
const app = express();
require('dotenv').config(); 

// Import Routes
const customerRoutes = require('./routes/customers');
const driverRoutes = require('./routes/drivers');
const paymentRoutes = require('./routes/payments');
const tripRoutes = require('./routes/trips');
const rideRoutes = require('./routes/rideRoutes');

app.use(express.json());


app.use('/customers', customerRoutes);
app.use('/drivers', driverRoutes);
app.use('/payments', paymentRoutes);
app.use('/trips', tripRoutes);
app.use('/rides', rideRoutes);  


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));