const {DateTime} = require('luxon');

const { sequelize, DataTypes } = require('../db/dbSQLite');

const Author = sequelize.define('Author', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  first_name: { type: DataTypes.STRING, allowNull: false, validate: { len: [1, 100] } },
  family_name: { type: DataTypes.STRING, allowNull: false, validate: { len: [1, 100] } },
  date_of_birth: { type: DataTypes.DATEONLY },
  date_of_death: { type: DataTypes.DATEONLY },
  image_path: { type: DataTypes.STRING }, 
  name: { 
    type: DataTypes.VIRTUAL, 
    get() { 
      return `${this.family_name}, ${this.first_name}`; 
    } 
  },
  lifespan: { 
    type: DataTypes.VIRTUAL, 
    get() { 
      console.log("this date of birth" + this.date_of_death)

      if (this.date_of_death == "Invalid date"){
        return `${this.date_of_birth} - ... `; 
      } else 
        return `${this.date_of_birth} - ${this.date_of_death}`; 

    } 
  },
  url: { 
    type: DataTypes.VIRTUAL, 
    get() { 
      return `/catalog/author/${this.id}`; 
    } 
  }
}, {
  tableName: 'Author',
  createdAt: false, 
  updatedAt: false,
});

module.exports = Author;
