module.exports = (sequelize, DataTypes) => {
  const Trip = sequelize.define('Trip', {
    status: {
      type: DataTypes.ENUM('Pending', 'Ongoing', 'Completed', 'Canceled'),
      defaultValue: 'Pending',
    },
    source: DataTypes.GEOMETRY('POINT'),
    destination: DataTypes.GEOMETRY('POINT'),
  }, {
    timestamps: true,
  });

  Trip.associate = (models) => {
    Trip.belongsTo(models.Rider, { foreignKey: 'riderID', allowNull: true });
    Trip.belongsTo(models.Driver, { foreignKey: 'driverID', allowNull: true });
    Trip.hasOne(models.Payment, { foreignKey: 'tripID' });
  };

  return Trip;
};