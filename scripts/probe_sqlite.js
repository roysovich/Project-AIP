const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, 'database.sqlite'),
    logging: false
});

const probe = async () => {
    try {
        await sequelize.authenticate();
        console.log('SQLite connected.');
        const [results] = await sequelize.query("SELECT name FROM sqlite_master WHERE type='table';");
        console.log('Tables:', results.map(r => r.name));

        if (results.some(r => r.name === 'currencies' || r.name === 'Currencies')) {
            const [rows] = await sequelize.query('SELECT count(*) as count FROM currencies');
            console.log('Currencies count:', rows[0].count);
        }
    } catch (err) {
        console.error('Error:', err);
    }
};

probe();
