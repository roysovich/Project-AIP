const dbConfig = require("../config/db.config.js");
const { Sequelize, DataTypes } = require('sequelize');

// Initialize Sequelize
const sequelize = new Sequelize(
    dbConfig.DB,
    dbConfig.USER,
    dbConfig.PASSWORD,
    {
        host: dbConfig.HOST,
        dialect: dbConfig.dialect,
        port: dbConfig.port,
        operatorsAliases: false,
        define: {
            underscored: true,        // Важно для snake_case
            timestamps: true,
            freezeTableName: true     // Не добавлять множественное число
        },
        pool: {
            max: dbConfig.pool.max,
            min: dbConfig.pool.min,
            acquire: dbConfig.pool.acquire,
            idle: dbConfig.pool.idle
        },
        logging: false
    }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.currency = require('./currency.model.js')(sequelize, DataTypes);
db.crypto = require('./crypto.model.js')(sequelize, DataTypes);
db.news = require('./news.model.js')(sequelize, DataTypes);
db.user = require('./user.model.js')(sequelize, DataTypes);
db.transaction = require('./transaction.model.js')(sequelize, DataTypes);

// Define associations
// User has many Transactions
db.user.hasMany(db.transaction, { foreignKey: 'user_id', as: 'transactions' });
db.transaction.belongsTo(db.user, { foreignKey: 'user_id', as: 'user' });

module.exports = db;
