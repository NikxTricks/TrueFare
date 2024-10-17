module.exports = (sequelize, DataTypes) => {
	const Payment = sequelize.define('Payment', {
	  amount: {
	    type: DataTypes.FLOAT,
	    allowNull: false
	  },
	  paymentMethod: {
	    type: DataTypes.STRING,  // e.g., 'credit card', 'stripe'
	    allowNull: false
	  },
	  paymentStatus: {
	    type: DataTypes.STRING,
	    allowNull: false
	  }
	});
     
	return Payment;
     };
     