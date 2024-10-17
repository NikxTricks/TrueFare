module.exports = (sequelize, DataTypes) => {
	const Driver = sequelize.define('Driver', {
	  name: {
	    type: DataTypes.STRING,
	    allowNull: false
	  },
	  email: {
	    type: DataTypes.STRING,
	    allowNull: false,
	    unique: true
	  },
	  phone: {
	    type: DataTypes.STRING
	  },
	  licenseNumber: {
	    type: DataTypes.STRING,
	    allowNull: false
	  },
	  carModel: {
	    type: DataTypes.STRING
	  }
	  // Add more fields as needed
	});
     
	// Define associations
	Driver.associate = models => {
	  Driver.hasMany(models.Trip, {
	    foreignKey: 'driverId',
	    as: 'trips'
	  });
	};
     
	return Driver;
     };
     