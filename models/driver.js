module.exports = (sequelize, DataTypes) => {
  const Driver = sequelize.define('Driver', {
    status: {
      type: DataTypes.ENUM('Active', 'Inactive'),
      defaultValue: 'Inactive',
    },
    disabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    location: DataTypes.GEOMETRY('POINT'),
  }, {
    timestamps: true,
  });

  Driver.associate = (models) => {
    Driver.belongsTo(models.User, { foreignKey: 'userID' });
    Driver.hasMany(models.Trip, { foreignKey: 'driverID' });
  };

  return Driver;
};