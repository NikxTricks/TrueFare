module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    googleId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  }, {
    timestamps: true,
  });

  User.associate = (models) => {
    User.hasOne(models.Rider, { foreignKey: 'userID', onDelete: 'CASCADE' });
    User.hasOne(models.Driver, { foreignKey: 'userID', onDelete: 'CASCADE' });
  };

  return User;
};