const { Sequelize, DataTypes, Model } = require('sequelize');
//  driver sqlite
// const sequelize = new Sequelize('sqlite::memory:');

// sql server
const sequelize = new Sequelize('KedaiPhoto', 'test', '123456', {
    dialect: 'mssql',
    dialectOptions: {
      // Observe the need for this nested `options` field for MSSQL
      options: {
        // Your tedious options here
        useUTC: false,
        dateFirst: 1,
      },
    },
  });
const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.fotos = require("./foto")(sequelize, Sequelize);
db.transaksis = require('./transaksi')(sequelize, Sequelize);
db.users = require('./user')(sequelize, Sequelize);

db.fotos.hasMany(db.fotos, {foreignKey:'iduser'});
db.users.belongsTo(db.users,{foreignKey:'id'});



module.exports = db;