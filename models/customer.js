module.exports = (sequelize, DataTypes) => {
	const Customer = sequelize.define('Customer', {
	  name: {
	    type: DataTypes.STRING,
	    allowNull: false
	  },
	  email: {
	    type: DataTypes.STRING,
	    allowNull: false,
	    unique: true
	  },
	  password: {
	    type: DataTypes.STRING,
	    allowNull: false
	  },
	  phone: {
	    type: DataTypes.STRING
	  }
	  // Add more fields as needed
	});
     
	// Define associations
	Customer.associate = models => {
	  Customer.hasMany(models.Trip, {
	    foreignKey: 'customerId',
	    as: 'trips'
	  });
	};
     
	return Customer;
     };
     