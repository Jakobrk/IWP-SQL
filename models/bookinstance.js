const { sequelize, DataTypes } = require('../db/dbSQLite');
const Book = require('./book');

const BookInstance = sequelize.define('BookInstance', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  bookId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Book, 
      key: 'id', 
    }
  },
  imprint: { type: DataTypes.STRING, allowNull: false },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "Maintenance",
    validate: {
      isIn: [['Available', 'Maintenance', 'Loaned', 'Reserved']]
    }
  },
  due_back: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
  url: { 
    type: DataTypes.VIRTUAL, 
    get() { 
      return `/catalog/bookinstance/${this.id}`; 
    } 
  }
}, {
  tableName: 'BookInstance',
  timestamps: false,
});

BookInstance.belongsTo(Book, { foreignKey: 'bookId' });

module.exports = BookInstance;
