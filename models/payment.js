module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define('Payment', {
    method: {
      type: DataTypes.ENUM('Cash', 'Card', 'UPI'),
      allowNull: false,
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
  }, {
    timestamps: true,
  });

  Payment.associate = (models) => {
    Payment.belongsTo(models.Trip, { foreignKey: 'tripID' });
  };

  return Payment;
};
