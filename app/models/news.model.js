module.exports = (sequelize, DataTypes) => {
    const NewsArticle = sequelize.define('NewsArticle', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        title: {
            type: DataTypes.STRING(500),
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT
        },
        url: {
            type: DataTypes.STRING(1000),
            allowNull: false
        },
        source: {
            type: DataTypes.STRING,
            allowNull: false
        },
        image_url: {
            type: DataTypes.STRING(1000)
        },
        published_at: {
            type: DataTypes.DATE,
            allowNull: false
        },
        category: {
            type: DataTypes.STRING(50),
            defaultValue: 'finance'
        }
    }, {
        tableName: 'news_articles',
        timestamps: true
    });

    return NewsArticle;
};
