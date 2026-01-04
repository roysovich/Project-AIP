const mongoose = require('mongoose');
const { Currency, CryptoCurrency, NewsArticle, User, Transaction, connectDB } = require('../models');

const seed = async () => {
    try {
        await connectDB();
        console.log('✅ MongoDB connected, starting seed...');

        // Clear existing data
        await Currency.deleteMany({});
        await CryptoCurrency.deleteMany({});
        await NewsArticle.deleteMany({});
        await User.deleteMany({});
        await Transaction.deleteMany({});
        console.log('🧹 Old data cleared.');

        // Seed Currencies
        const currencies = [
            { id: 1, code: 'USD', name: 'US Dollar', symbol: '$', rate_to_usd: 1.0 },
            { id: 2, code: 'EUR', name: 'Euro', symbol: '€', rate_to_usd: 1.05 },
            { id: 3, code: 'GBP', name: 'British Pound', symbol: '£', rate_to_usd: 1.25 },
            { id: 4, code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate_to_usd: 0.007 },
            { id: 5, code: 'RUB', name: 'Russian Ruble', symbol: '₽', rate_to_usd: 0.011 }
        ];
        await Currency.insertMany(currencies);
        console.log('💵 Currencies seeded.');

        // Seed Crypto
        const cryptos = [
            { id: 1, symbol: 'BTC', name: 'Bitcoin', current_price_usd: 45000, market_cap: 850000000000, price_change_24h: 2.5, volume_24h: 30000000000 },
            { id: 2, symbol: 'ETH', name: 'Ethereum', current_price_usd: 3500, market_cap: 400000000000, price_change_24h: 1.2, volume_24h: 15000000000 },
            { id: 3, symbol: 'USDT', name: 'Tether', current_price_usd: 1.0, market_cap: 90000000000, price_change_24h: 0.01, volume_24h: 50000000000 }
        ];
        await CryptoCurrency.insertMany(cryptos);
        console.log('🪙 Crypto seeded.');

        // Seed Users
        const users = [
            { id: 1, name: 'Admin User', email: 'admin@admin.com', phone: '1234567890', preferred_currency: 'USD' },
            { id: 2, name: 'Test User', email: 'test@user.com', phone: '0987654321', preferred_currency: 'EUR' }
        ];
        await User.insertMany(users);
        console.log('👥 Users seeded.');

        // Seed News (Optional)
        const news = [
            {
                id: 1,
                title: 'Welcome to the platform',
                description: 'This is a sample news article.',
                url: 'http://localhost:3000',
                source: 'Platform',
                published_at: new Date()
            }
        ];
        await NewsArticle.insertMany(news);
        console.log('📰 News seeded.');

        console.log('🎉 Seeding completed successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seeding failed:', err);
        process.exit(1);
    }
};

seed();
