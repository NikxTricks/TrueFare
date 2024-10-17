module.exports = (sequelize, DataTypes) => {
	const Trip = sequelize.define('Trip', {
	  pickupLocation: {
	    type: DataTypes.STRING,
	    allowNull: false
	  },
	  dropoffLocation: {
	    type: DataTypes.STRING,
	    allowNull: false
	  },
	  fare: {
	    type: DataTypes.FLOAT,
	    allowNull: false
	  },
	  status: {
	    type: DataTypes.STRING,
	    allowNull: false  // e.g., 'pending', 'completed', 'canceled'
	  }
	});
     
	// Define associations
	Trip.associate = models => {
	  Trip.belongsTo(models.Customer, {
	    foreignKey: 'customerId',
	    as: 'customer'
	  });
	  Trip.belongsTo(models.Driver, {
	    foreignKey: 'driverId',
	    as: 'driver'
	  });
	};
     
	return Trip;
     };
     