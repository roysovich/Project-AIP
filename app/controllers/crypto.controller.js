const db = require("../models");
const CryptoCurrency = db.crypto;
const Op = db.Sequelize.Op;
const axios = require('axios');

// Создание новой криптовалюты
exports.create = (req, res) => {
    if (!req.body.symbol) {
        res.status(400).send({
            message: "Символ криптовалюты не может быть пустым!"
        });
        return;
    }

    const crypto = {
        symbol: req.body.symbol,
        name: req.body.name,
        current_price_usd: req.body.current_price_usd,
        market_cap: req.body.market_cap,
        price_change_24h: req.body.price_change_24h,
        volume_24h: req.body.volume_24h
    };

    CryptoCurrency.create(crypto)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при создании криптовалюты"
            });
        });
};

// Получить все криптовалюты
exports.findAll = (req, res) => {
    const symbol = req.query.symbol;
    var condition = symbol ? { symbol: { [Op.iLike]: `%${symbol}%` } } : null;

    CryptoCurrency.findAll({ where: condition, order: [['market_cap', 'DESC']] })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при получении криптовалют"
            });
        });
};

// Найти криптовалюту по id
exports.findOne = (req, res) => {
    const id = req.params.id;

    CryptoCurrency.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Криптовалюта с id=${id} не найдена`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: `Ошибка при получении криптовалюты с id=${id}`
            });
        });
};

// Обновить криптовалюту по id
exports.update = (req, res) => {
    const id = req.params.id;

    CryptoCurrency.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Криптовалюта успешно обновлена"
                });
            } else {
                res.send({
                    message: `Не удалось обновить криптовалюту с id=${id}`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: `Ошибка при обновлении криптовалюты с id=${id}`
            });
        });
};

// Удалить криптовалюту по id
exports.delete = (req, res) => {
    const id = req.params.id;

    CryptoCurrency.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Криптовалюта успешно удалена"
                });
            } else {
                res.send({
                    message: `Не удалось удалить криптовалюту с id=${id}`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: `Ошибка при удалении криптовалюты с id=${id}`
            });
        });
};

// Удалить все криптовалюты
exports.deleteAll = (req, res) => {
    CryptoCurrency.destroy({
        where: {},
        truncate: false
    })
        .then(nums => {
            res.send({ message: `${nums} криптовалют успешно удалены` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при удалении всех криптовалют"
            });
        });
};

// Метод для обновления цен через внешний API
exports.refreshRates = async (req, res) => {
    try {
        // Используем CoinGecko API (бесплатный, без ключа)
        const symbols = ['bitcoin', 'ethereum', 'tether', 'binancecoin', 'ripple', 'solana'];
        const response = await axios.get('https://api.coingecko.com/api/v3/simple/price', {
            params: {
                ids: symbols.join(','),
                vs_currencies: 'usd',
                include_market_cap: true,
                include_24hr_change: true,
                include_24hr_vol: true
            }
        });

        const data = response.data;

        // Маппинг ID к символам
        const idToSymbol = {
            'bitcoin': 'BTC',
            'ethereum': 'ETH',
            'tether': 'USDT',
            'binancecoin': 'BNB',
            'ripple': 'XRP',
            'solana': 'SOL'
        };

        // Обновляем данные в базе
        for (const [id, info] of Object.entries(data)) {
            const symbol = idToSymbol[id];
            const crypto = await CryptoCurrency.findOne({ where: { symbol } });

            if (crypto) {
                crypto.current_price_usd = info.usd;
                crypto.market_cap = info.usd_market_cap;
                crypto.price_change_24h = info.usd_24h_change;
                crypto.volume_24h = info.usd_24h_vol;
                crypto.last_updated = new Date();
                await crypto.save();
            }
        }

        const updatedCryptos = await CryptoCurrency.findAll();
        res.json({
            success: true,
            message: 'Цены криптовалют обновлены',
            cryptos: updatedCryptos
        });
    } catch (err) {
        console.error('Error refreshing crypto:', err.message);
        res.status(500).json({ error: 'Ошибка при обновлении криптовалют' });
    }
};

// Получить топ-3 криптовалюты с наибольшим ростом за 24 часа
exports.getTopGainers = async (req, res) => {
    try {
        const result = await db.sequelize.query(
            `SELECT 
                symbol,
                name,
                current_price_usd,
                price_change_24h,
                market_cap
             FROM cryptocurrencies
             WHERE price_change_24h IS NOT NULL
             ORDER BY price_change_24h DESC
             LIMIT 3`,
            {
                type: db.Sequelize.QueryTypes.SELECT
            }
        );
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            error: 'Ошибка при получении топ растущих криптовалют',
            details: error.message 
        });
    }
};

// Получить криптовалюты с волатильностью > 5%
exports.getVolatileCryptos = async (req, res) => {
    try {
        const volatilityThreshold = req.query.threshold || 5;
        const result = await db.sequelize.query(
            `SELECT 
                symbol,
                name,
                current_price_usd,
                ABS(price_change_24h) as volatility,
                price_change_24h
             FROM cryptocurrencies
             WHERE ABS(price_change_24h) > :threshold
             ORDER BY ABS(price_change_24h) DESC`,
            {
                replacements: { threshold: volatilityThreshold },
                type: db.Sequelize.QueryTypes.SELECT
            }
        );
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            error: 'Ошибка при получении волатильных криптовалют',
            details: error.message 
        });
    }
};