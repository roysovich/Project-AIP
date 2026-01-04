module.exports = (sequelize, DataTypes) => {
    const Transaction = sequelize.define('Transaction', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        from_currency: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        to_currency: {
            type: DataTypes.STRING(10),
            allowNull: false
        },
        amount: {
            type: DataTypes.DECIMAL(18, 8),
            allowNull: false
        },
        converted_amount: {
            type: DataTypes.DECIMAL(18, 8),
            allowNull: false
        },
        rate_used: {
            type: DataTypes.DECIMAL(18, 8),
            allowNull: false
        },
        transaction_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        status: {
            type: DataTypes.ENUM('completed', 'pending', 'failed'),
            defaultValue: 'completed'
        }
    }, {
        tableName: 'transactions',
        timestamps: true
    });

    return Transaction;
};
