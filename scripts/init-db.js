require('dotenv').config();
const db = require('../app/models');

const currencyData = [
    { code: 'USD', name: 'US Dollar', symbol: '$', rate_to_usd: 1.0 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate_to_usd: 1.09 },
    { code: 'RUB', name: 'Russian Ruble', symbol: '₽', rate_to_usd: 0.011 },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', rate_to_usd: 0.14 },
    { code: 'GBP', name: 'British Pound', symbol: '£', rate_to_usd: 1.27 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate_to_usd: 0.0067 },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'Fr', rate_to_usd: 1.14 },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate_to_usd: 0.72 },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate_to_usd: 0.65 },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate_to_usd: 0.012 }
];

const cryptoData = [
    {
        symbol: 'BTC',
        name: 'Bitcoin',
        current_price_usd: 42150.50,
        market_cap: 822000000000,
        price_change_24h: 2.45,
        volume_24h: 25000000000
    },
    {
        symbol: 'ETH',
        name: 'Ethereum',
        current_price_usd: 2245.75,
        market_cap: 270000000000,
        price_change_24h: -1.23,
        volume_24h: 12000000000
    },
    {
        symbol: 'USDT',
        name: 'Tether',
        current_price_usd: 1.00,
        market_cap: 95000000000,
        price_change_24h: 0.01,
        volume_24h: 45000000000
    },
    {
        symbol: 'BNB',
        name: 'Binance Coin',
        current_price_usd: 312.40,
        market_cap: 48000000000,
        price_change_24h: 1.87,
        volume_24h: 1500000000
    },
    {
        symbol: 'XRP',
        name: 'Ripple',
        current_price_usd: 0.62,
        market_cap: 33000000000,
        price_change_24h: 3.21,
        volume_24h: 2000000000
    },
    {
        symbol: 'SOL',
        name: 'Solana',
        current_price_usd: 98.30,
        market_cap: 42000000000,
        price_change_24h: -0.95,
        volume_24h: 1800000000
    }
];

const newsData = [
    {
        title: 'Федеральная резервная система сохранила процентную ставку',
        description: 'ФРС США оставила ключевую ставку без изменений на уровне 5.25-5.50%, сославшись на инфляционные риски.',
        url: 'https://example.com/news1',
        source: 'Financial Times',
        published_at: new Date('2024-12-08'),
        category: 'monetary-policy'
    },
    {
        title: 'Биткоин достиг нового максимума за год',
        description: 'Крупнейшая криптовалюта преодолела отметку в $42,000 на фоне растущего интереса институциональных инвесторов.',
        url: 'https://example.com/news2',
        source: 'CoinDesk',
        published_at: new Date('2024-12-08'),
        category: 'cryptocurrency'
    },
    {
        title: 'Курс евро укрепился к доллару',
        description: 'Европейская валюта показала рост на 0.8% после позитивных экономических данных из еврозоны.',
        url: 'https://example.com/news3',
        source: 'Reuters',
        published_at: new Date('2024-12-07'),
        category: 'forex'
    },
    {
        title: 'Центробанк РФ повысил прогноз по инфляции',
        description: 'ЦБ России пересмотрел прогноз инфляции на 2024 год с учетом текущей экономической ситуации.',
        url: 'https://example.com/news4',
        source: 'Интерфакс',
        published_at: new Date('2024-12-07'),
        category: 'monetary-policy'
    },
    {
        title: 'Золото достигло рекордных значений',
        description: 'Цена на золото превысила $2,100 за унцию на фоне геополитической неопределенности.',
        url: 'https://example.com/news5',
        source: 'Bloomberg',
        published_at: new Date('2024-12-06'),
        category: 'commodities'
    }
];

const userData = [
    { name: 'Иван Иванов', email: 'ivan@example.com', phone: '+79001234567', preferred_currency: 'RUB' },
    { name: 'Anna Smith', email: 'anna@example.com', phone: '+1234567890', preferred_currency: 'USD' },
    { name: 'Петр Петров', email: 'petr@example.com', phone: '+79007654321', preferred_currency: 'RUB' }
];

async function initializeDatabase() {
    try {
        console.log('🔄 Начинаю инициализацию базы данных...');

        // Синхронизация с force: true пересоздаст все таблицы
        await db.sequelize.sync({ force: true });
        console.log('✅ Таблицы созданы');

        // Создаем валюты
        const currencies = await db.currency.bulkCreate(currencyData);
        console.log(`✅ Добавлено ${currencies.length} валют`);

        // Создаем криптовалюты
        const cryptos = await db.crypto.bulkCreate(cryptoData);
        console.log(`✅ Добавлено ${cryptos.length} криптовалют`);

        // Создаем новости
        const news = await db.news.bulkCreate(newsData);
        console.log(`✅ Добавлено ${news.length} новостей`);

        // Создаем пользователей
        const users = await db.user.bulkCreate(userData);
        console.log(`✅ Добавлено ${users.length} пользователей`);

        // Создаем несколько транзакций
        await db.transaction.create({
            user_id: users[0].id,
            from_currency: 'USD',
            to_currency: 'RUB',
            amount: 100,
            converted_amount: 9090.91,
            rate_used: 90.91,
            status: 'completed'
        });

        await db.transaction.create({
            user_id: users[1].id,
            from_currency: 'EUR',
            to_currency: 'USD',
            amount: 500,
            converted_amount: 545.00,
            rate_used: 1.09,
            status: 'completed'
        });

        await db.transaction.create({
            user_id: users[2].id,
            from_currency: 'BTC',
            to_currency: 'USD',
            amount: 0.5,
            converted_amount: 21075.25,
            rate_used: 42150.50,
            status: 'completed'
        });

        console.log('✅ Добавлено 3 транзакции');
        console.log('');
        console.log('🎉 База данных успешно заполнена тестовыми данными!');
        console.log('📊 Статистика:');
        console.log(`   - Валют: ${currencies.length}`);
        console.log(`   - Криптовалют: ${cryptos.length}`);
        console.log(`   - Новостей: ${news.length}`);
        console.log(`   - Пользователей: ${users.length}`);
        console.log(`   - Транзакций: 3`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Ошибка при заполнении базы данных:', err);
        process.exit(1);
    }
}

initializeDatabase();
