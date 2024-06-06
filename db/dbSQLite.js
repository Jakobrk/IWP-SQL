const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: './db/data.db'
});


module.exports = { sequelize, DataTypes };
