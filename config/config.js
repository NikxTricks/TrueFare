// config/config.js
require('dotenv').config();

module.exports = {
  "development": {
    "username": process.env.DB_USER || "your_db_username",
    "password": process.env.DB_PASS || "your_db_password",
    "database": process.env.DB_NAME || "your_database_name",
    "host": process.env.DB_HOST || "localhost",
    "port": process.env.DB_PORT || 5432,
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": process.env.DB_SSL === 'true' ? {
        "require": true,
        "rejectUnauthorized": false // Adjust as per your SSL requirements
      } : false
    },
    "logging": false
  },
  "test": {
    "username": process.env.DB_USER || "your_db_username",
    "password": process.env.DB_PASS || "your_db_password",
    "database": process.env.DB_NAME || "your_database_name",
    "host": process.env.DB_HOST || "localhost",
    "port": process.env.DB_PORT || 5432,
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": process.env.DB_SSL === 'true' ? {
        "require": true,
        "rejectUnauthorized": false
      } : false
    },
    "logging": false
  },
  "production": {
    "username": process.env.DB_USER || "your_db_username",
    "password": process.env.DB_PASS || "your_db_password",
    "database": process.env.DB_NAME || "your_database_name",
    "host": process.env.DB_HOST || "localhost",
    "port": process.env.DB_PORT || 5432,
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": process.env.DB_SSL === 'true' ? {
        "require": true,
        "rejectUnauthorized": false
      } : false
    },
    "logging": false
  }
};