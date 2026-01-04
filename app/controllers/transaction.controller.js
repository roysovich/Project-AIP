const db = require("../models");
const Transaction = db.transaction;
const Currency = db.currency;
const CryptoCurrency = db.crypto;
const Op = db.Sequelize.Op;

// Создание новой транзакции
exports.create = (req, res) => {
    if (!req.body.user_id) {
        res.status(400).send({
            message: "User ID не может быть пустым!"
        });
        return;
    }

    const transaction = {
        user_id: req.body.user_id,
        from_currency: req.body.from_currency,
        to_currency: req.body.to_currency,
        amount: req.body.amount,
        converted_amount: req.body.converted_amount,
        rate_used: req.body.rate_used,
        status: req.body.status || 'completed'
    };

    Transaction.create(transaction)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при создании транзакции"
            });
        });
};

// Получить все транзакции
exports.findAll = (req, res) => {
    Transaction.findAll({
        include: [{
            model: db.user,
            as: 'user'
        }],
        order: [['createdAt', 'DESC']],
        limit: 50
    })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при получении транзакций"
            });
        });
};

// Найти транзакцию по id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Transaction.findByPk(id, {
        include: [{
            model: db.user,
            as: 'user'
        }]
    })
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Транзакция с id=${id} не найдена`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: `Ошибка при получении транзакции с id=${id}`
            });
        });
};

// Обновить транзакцию по id
exports.update = (req, res) => {
    const id = req.params.id;

    Transaction.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Транзакция успешно обновлена"
                });
            } else {
                res.send({
                    message: `Не удалось обновить транзакцию с id=${id}`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: `Ошибка при обновлении транзакции с id=${id}`
            });
        });
};

// Удалить транзакцию по id
exports.delete = (req, res) => {
    const id = req.params.id;

    Transaction.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Транзакция успешно удалена"
                });
            } else {
                res.send({
                    message: `Не удалось удалить транзакцию с id=${id}`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: `Ошибка при удалении транзакции с id=${id}`
            });
        });
};

// Удалить все транзакции
exports.deleteAll = (req, res) => {
    Transaction.destroy({
        where: {},
        truncate: false
    })
        .then(nums => {
            res.send({ message: `${nums} транзакций успешно удалены` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при удалении всех транзакций"
            });
        });
};

// Конвертировать валюты (калькулятор)
exports.convert = async (req, res) => {
    try {
        const { from, to, amount, user_id } = req.body;

        let rate;
        let convertedAmount;
        let isCrypto = false;

        // Проверяем, является ли конвертация криптовалютой
        const fromCrypto = await CryptoCurrency.findOne({ where: { symbol: from } });
        const toCrypto = await CryptoCurrency.findOne({ where: { symbol: to } });

        if (fromCrypto || toCrypto) {
            // Конвертация с участием криптовалюты
            if (fromCrypto && to === 'USD') {
                rate = fromCrypto.current_price_usd;
                convertedAmount = amount * rate;
            } else if (from === 'USD' && toCrypto) {
                rate = 1 / toCrypto.current_price_usd;
                convertedAmount = amount * rate;
            } else {
                // Через USD как промежуточную валюту
                const fromRate = fromCrypto ? fromCrypto.current_price_usd : 1;
                const toRate = toCrypto ? toCrypto.current_price_usd : 1;
                rate = fromRate / toRate;
                convertedAmount = amount * rate;
            }
            isCrypto = true;
        } else {
            // Обычная фиатная конвертация
            const fromCurrency = await Currency.findOne({ where: { code: from } });
            const toCurrency = await Currency.findOne({ where: { code: to } });

            if (!fromCurrency || !toCurrency) {
                return res.status(404).json({ error: 'Валюта не найдена' });
            }

            // Конвертация через USD
            const amountInUSD = amount * fromCurrency.rate_to_usd;
            convertedAmount = amountInUSD / toCurrency.rate_to_usd;
            rate = fromCurrency.rate_to_usd / toCurrency.rate_to_usd;
        }

        // Сохраняем транзакцию, если указан user_id
        if (user_id) {
            await Transaction.create({
                user_id,
                from_currency: from,
                to_currency: to,
                amount,
                converted_amount: convertedAmount,
                rate_used: rate,
                status: 'completed'
            });
        }

        res.json({
            from,
            to,
            amount,
            converted_amount: convertedAmount,
            rate,
            is_crypto: isCrypto
        });
    } catch (err) {
        console.error('Error in conversion:', err);
        res.status(500).json({ error: 'Ошибка при конвертации' });
    }
};

// Получить историю конвертаций пользователя
exports.getUserConversionHistory = async (req, res) => {
    const userId = req.params.userId;
    
    try {
        const result = await db.sequelize.query(
            `SELECT 
                t.id,
                t.from_currency,
                t.to_currency,
                t.amount,
                t.converted_amount,
                t.rate_used,
                t.created_at,
                u.name as user_name
             FROM transactions t
             JOIN users u ON t.user_id = u.id
             WHERE t.user_id = :userId
             ORDER BY t.created_at DESC`,
            {
                replacements: { userId: userId },
                type: db.Sequelize.QueryTypes.SELECT
            }
        );
        
        res.json(result);
    } catch (error) {
        res.status(500).json({
            error: 'Ошибка при получении истории',
            details: error.message
        });
    }
};

// Получить сводку операций за день
exports.getDailySummary = async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];
        const result = await db.sequelize.query(
            `SELECT 
                DATE(created_at) as transaction_date,
                COUNT(*) as total_transactions,
                SUM(amount) as total_amount,
                AVG(rate_used) as avg_rate,
                COUNT(DISTINCT user_id) as unique_users
             FROM transactions
             WHERE DATE(created_at) = :date
             GROUP BY DATE(created_at)`,
            {
                replacements: { date: date },
                type: db.Sequelize.QueryTypes.SELECT
            }
        );
        
        if (result.length === 0) {
            return res.json({
                date: date,
                total_transactions: 0,
                total_amount: 0,
                avg_rate: 0,
                unique_users: 0
            });
        }
        
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({
            error: 'Ошибка при получении сводки за день',
            details: error.message
        });
    }
};

// Получить объем конвертаций по валютам
exports.getConversionVolume = async (req, res) => {
    try {
        const result = await db.sequelize.query(
            `SELECT 
                from_currency,
                to_currency,
                COUNT(*) as transaction_count,
                SUM(amount) as total_volume,
                AVG(rate_used) as avg_rate
             FROM transactions
             GROUP BY from_currency, to_currency
             ORDER BY total_volume DESC`,
            {
                type: db.Sequelize.QueryTypes.SELECT
            }
        );
        
        res.json(result);
    } catch (error) {
        res.status(500).json({
            error: 'Ошибка при получении объема конвертаций',
            details: error.message
        });
    }
};