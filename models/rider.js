module.exports = (sequelize, DataTypes) => {
  const Rider = sequelize.define('Rider', {
    location: DataTypes.GEOMETRY('POINT'),
    lastKnownLocation: DataTypes.GEOMETRY('POINT'),
    disabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    timestamps: true,
  });

  Rider.associate = (models) => {
    Rider.belongsTo(models.User, { foreignKey: 'userID' });
    Rider.hasMany(models.Trip, { foreignKey: 'riderID' });
  };

  return Rider;
};