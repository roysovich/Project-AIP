const db = require("../models");
const Currency = db.currency;
const Op = db.Sequelize.Op;
const axios = require('axios');

// Создание новой валюты
exports.create = (req, res) => {
    if (!req.body.code) {
        res.status(400).send({
            message: "Код валюты не может быть пустым!"
        });
        return;
    }

    const currency = {
        code: req.body.code,
        name: req.body.name,
        symbol: req.body.symbol,
        rate_to_usd: req.body.rate_to_usd,
        last_updated: req.body.last_updated
    };

    Currency.create(currency)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при создании валюты"
            });
        });
};

// Получить все валюты
exports.findAll = (req, res) => {
    const code = req.query.code;
    var condition = code ? { code: { [Op.iLike]: `%${code}%` } } : null;

    Currency.findAll({ where: condition, order: [['code', 'ASC']] })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при получении валют"
            });
        });
};

// Получить валюты с пагинацией
exports.findAllPaged = (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;
    const code = req.query.code;
    const condition = code ? { code: { [Op.iLike]: `%${code}%` } } : null;

    const offset = (page - 1) * size;
    const limit = size;

    Currency.findAndCountAll({
        where: condition,
        order: [['code', 'ASC']],
        limit: limit,
        offset: offset
    })
        .then(data => {
            const totalPages = Math.ceil(data.count / size);
            res.send({
                totalItems: data.count,
                totalPages: totalPages,
                currentPage: page,
                items: data.rows
            });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при получении валют"
            });
        });
};

// Найти валюту по id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Currency.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Валюта с id=${id} не найдена`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: `Ошибка при получении валюты с id=${id}`
            });
        });
};

// Обновить валюту по id
exports.update = (req, res) => {
    const id = req.params.id;

    Currency.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Валюта успешно обновлена"
                });
            } else {
                res.send({
                    message: `Не удалось обновить валюту с id=${id}`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: `Ошибка при обновлении валюты с id=${id}`
            });
        });
};

// Удалить валюту по id
exports.delete = (req, res) => {
    const id = req.params.id;

    Currency.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Валюта успешно удалена"
                });
            } else {
                res.send({
                    message: `Не удалось удалить валюту с id=${id}`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: `Ошибка при удалении валюты с id=${id}`
            });
        });
};

// Удалить все валюты
exports.deleteAll = (req, res) => {
    Currency.destroy({
        where: {},
        truncate: false
    })
        .then(nums => {
            res.send({ message: `${nums} валют успешно удалены` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при удалении всех валют"
            });
        });
};

// Метод для обновления курсов через внешний API
exports.refreshRates = async (req, res) => {
    try {
        // Используем бесплатный API exchangerate-api.com
        const response = await axios.get('https://api.exchangerate-api.com/v4/latest/USD');
        const rates = response.data.rates;

        // Обновляем курсы в базе данных
        const updatePromises = Object.entries(rates).map(async ([code, rate]) => {
            const currency = await Currency.findOne({ where: { code } });
            if (currency) {
                currency.rate_to_usd = 1 / rate; // Конвертируем в курс к USD
                currency.last_updated = new Date();
                await currency.save();
            }
        });

        await Promise.all(updatePromises);

        const updatedCurrencies = await Currency.findAll();
        res.json({
            success: true,
            message: 'Курсы валют обновлены',
            currencies: updatedCurrencies
        });
    } catch (err) {
        console.error('Error refreshing currencies:', err);
        res.status(500).json({ error: 'Ошибка при обновлении курсов валют' });
    }
};

// Получить статистику по валютам
exports.getCurrencyStats = async (req, res) => {
    try {
        const result = await db.sequelize.query(
            `SELECT 
                c.code,
                c.name,
                COUNT(t.id) as transaction_count,
                AVG(c.rate_to_usd) as avg_rate,
                MAX(c.last_updated) as last_updated
             FROM currencies c
             LEFT JOIN transactions t ON c.code = t.from_currency OR c.code = t.to_currency
             GROUP BY c.id, c.code, c.name
             ORDER BY transaction_count DESC`,
            {
                type: db.Sequelize.QueryTypes.SELECT
            }
        );
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            error: 'Ошибка при получении статистики',
            details: error.message 
        });
    }
};

// Получить валюту с наивысшим курсом
exports.getCurrencyWithHighestRate = async (req, res) => {
    try {
        const result = await db.sequelize.query(
            `SELECT * FROM currencies ORDER BY rate_to_usd DESC LIMIT 1`,
            {
                type: db.Sequelize.QueryTypes.SELECT
            }
        );
        
        if (result.length === 0) {
            return res.status(404).json({ error: 'Валюты не найдены' });
        }
        
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ 
            error: 'Ошибка при получении валюты',
            details: error.message 
        });
    }
};

// Найти валюты по паттерну символа
exports.getCurrenciesBySymbolPattern = async (req, res) => {
    try {
        const pattern = req.params.pattern;
        const result = await db.sequelize.query(
            `SELECT * FROM currencies WHERE symbol LIKE :pattern`,
            {
                replacements: { pattern: `%${pattern}%` },
                type: db.Sequelize.QueryTypes.SELECT
            }
        );
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            error: 'Ошибка при поиске валют',
            details: error.message 
        });
    }
};

// Получить статистику обмена для валюты
exports.getCurrencyExchangeStats = async (req, res) => {
    try {
        const currencyId = req.params.id;
        const result = await db.sequelize.query(
            `SELECT 
                c.code,
                c.name,
                COUNT(t.id) as operation_count,
                SUM(t.amount) as total_amount,
                AVG(t.rate_used) as avg_rate
             FROM currencies c
             LEFT JOIN transactions t ON (c.code = t.from_currency OR c.code = t.to_currency)
             WHERE c.id = :currencyId
             GROUP BY c.id, c.code, c.name`,
            {
                replacements: { currencyId: currencyId },
                type: db.Sequelize.QueryTypes.SELECT
            }
        );
        
        if (result.length === 0) {
            return res.status(404).json({ error: 'Валюта не найдена' });
        }
        
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ 
            error: 'Ошибка при получении статистики обмена',
            details: error.message 
        });
    }
};

// Получить самые популярные валюты в транзакциях
exports.getPopularCurrencies = async (req, res) => {
    try {
        const result = await db.sequelize.query(
            `SELECT 
                c.code,
                c.name,
                c.symbol,
                COUNT(t.id) as usage_count
             FROM currencies c
             INNER JOIN transactions t ON (c.code = t.from_currency OR c.code = t.to_currency)
             GROUP BY c.id, c.code, c.name, c.symbol
             ORDER BY usage_count DESC
             LIMIT 10`,
            {
                type: db.Sequelize.QueryTypes.SELECT
            }
        );
        
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            error: 'Ошибка при получении популярных валют',
            details: error.message 
        });
    }
};

// Получить кросс-курсы между валютами
exports.getCrossRates = async (req, res) => {
    try {
        const { from, to } = req.query;
        
        if (!from || !to) {
            return res.status(400).json({ error: 'Необходимо указать параметры from и to' });
        }
        
        const result = await db.sequelize.query(
            `SELECT 
                c1.code as from_currency,
                c1.rate_to_usd as from_rate,
                c2.code as to_currency,
                c2.rate_to_usd as to_rate,
                (c1.rate_to_usd / c2.rate_to_usd) as cross_rate
             FROM currencies c1, currencies c2
             WHERE c1.code = :from AND c2.code = :to`,
            {
                replacements: { from: from, to: to },
                type: db.Sequelize.QueryTypes.SELECT
            }
        );
        
        if (result.length === 0) {
            return res.status(404).json({ error: 'Валюты не найдены' });
        }
        
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({ 
            error: 'Ошибка при расчете кросс-курса',
            details: error.message 
        });
    }
};