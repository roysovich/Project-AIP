module.exports = (sequelize, DataTypes) => {
    const CryptoCurrency = sequelize.define('CryptoCurrency', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        symbol: {
            type: DataTypes.STRING(10),
            allowNull: false,
            unique: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        current_price_usd: {
            type: DataTypes.DECIMAL(18, 8),
            allowNull: false
        },
        market_cap: {
            type: DataTypes.BIGINT
        },
        price_change_24h: {
            type: DataTypes.DECIMAL(10, 2)
        },
        volume_24h: {
            type: DataTypes.BIGINT
        },
        last_updated: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: 'cryptocurrencies',
        timestamps: true
    });

    return CryptoCurrency;
};
