module.exports = (sequelize, DataTypes) => {
    const Currency = sequelize.define('Currency', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        code: {
            type: DataTypes.STRING(3),
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        symbol: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        rate_to_usd: {
            type: DataTypes.DECIMAL(18, 8),
            allowNull: false,
            defaultValue: 1.0
        },
        last_updated: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'currencies',
        timestamps: true
    });

    return Currency;
};
