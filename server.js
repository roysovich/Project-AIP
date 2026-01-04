require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3000;

// Swagger configuration
const swaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Money Project API',
            version: '1.0.0',
            description: 'API для управления валютами, криптовалютами, новостями и транзакциями',
            contact: {
                name: 'API Support',
                email: 'support@moneyproject.com'
            },
            license: {
                name: 'ISC',
                url: 'https://opensource.org/licenses/ISC'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            }
        ],
        tags: [
            {
                name: 'Currency',
                description: 'Операции с валютами'
            },
            {
                name: 'Crypto',
                description: 'Операции с криптовалютами'
            },
            {
                name: 'News',
                description: 'Операции с новостями'
            },
            {
                name: 'Users',
                description: 'Операции с пользователями'
            },
            {
                name: 'Transactions',
                description: 'Операции с транзакциями'
            },
            {
                name: 'Calculator',
                description: 'Калькулятор конвертации валют'
            }
        ]
    },
    apis: ['./app/routes/*.routes.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Initialize database
const db = require('./app/models');
db.sequelize.sync()
    .then(() => {
        console.log("✅ База данных синхронизирована");
    })
    .catch((err) => {
        console.log("❌ Ошибка синхронизации базы данных: " + err.message);
    });

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Импортируем маршруты
const currencyRoutes = require('./app/routes/currency.routes');
const cryptoRoutes = require('./app/routes/crypto.routes');
const newsRoutes = require('./app/routes/news.routes');
const userRoutes = require('./app/routes/user.routes');
const transactionRoutes = require('./app/routes/transaction.routes');

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Подключаем маршруты
app.use('/api/currencies', currencyRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/transactions', transactionRoutes);

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Админ панель
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📱 Откройте http://localhost:${PORT} в браузере`);
    console.log(`🔧 Админ панель: http://localhost:${PORT}/admin`);
    console.log(`📚 Swagger документация: http://localhost:${PORT}/api-docs`);
});
