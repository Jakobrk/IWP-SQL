const { sequelize, DataTypes } = require('../db/dbSQLite');

const Genre = sequelize.define('Genre', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 100]  // Ensures the name is between 3 and 100 characters
    }
  },
  url: { 
    type: DataTypes.VIRTUAL, 
    get() { 
      return `/catalog/genre/${this.id}`; 
    } 
  }
}, {
  tableName: 'Genre',  // Make sure the table name is correct
  timestamps: false,
});

module.exports = Genre;
