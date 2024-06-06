const { sequelize, DataTypes } = require('../db/dbSQLite');
const Author = require('./author');
const Genre = require('./genre');

const Book = sequelize.define('Book', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  authorId: { 
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  summary: { type: DataTypes.STRING, allowNull: false },
  isbn: { type: DataTypes.STRING, allowNull: false },
  genre: {type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true
  },
  url: { 
    type: DataTypes.VIRTUAL, 
    get() { 
      return `/catalog/book/${this.id}`; 
    } 
  }
}, {
  tableName: 'Book',
  createdAt: false,
  updatedAt: false,
});

Book.belongsTo(Author, { foreignKey: 'authorId', targetKey: 'id' });
Book.belongsTo(Genre, { foreignKey: 'genre', targetKey: 'id' });


module.exports = Book;
