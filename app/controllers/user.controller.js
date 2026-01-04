const db = require("../models");
const User = db.user;
const Op = db.Sequelize.Op;

// Создание нового пользователя
exports.create = (req, res) => {
    if (!req.body.email) {
        res.status(400).send({
            message: "Email не может быть пустым!"
        });
        return;
    }

    const user = {
        name: req.body.name,
        email: req.body.email,
        phone: req.body.phone,
        preferred_currency: req.body.preferred_currency
    };

    User.create(user)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при создании пользователя"
            });
        });
};

// Получить всех пользователей
exports.findAll = (req, res) => {
    const name = req.query.name;
    var condition = name ? { name: { [Op.iLike]: `%${name}%` } } : null;

    User.findAll({
        where: condition,
        include: [{
            model: db.transaction,
            as: 'transactions',
            limit: 5,
            order: [['createdAt', 'DESC']]
        }]
    })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при получении пользователей"
            });
        });
};

// Найти пользователя по id
exports.findOne = (req, res) => {
    const id = req.params.id;

    User.findByPk(id, {
        include: [{
            model: db.transaction,
            as: 'transactions'
        }]
    })
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Пользователь с id=${id} не найден`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: `Ошибка при получении пользователя с id=${id}`
            });
        });
};

// Обновить пользователя по id
exports.update = (req, res) => {
    const id = req.params.id;

    User.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Пользователь успешно обновлен"
                });
            } else {
                res.send({
                    message: `Не удалось обновить пользователя с id=${id}`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: `Ошибка при обновлении пользователя с id=${id}`
            });
        });
};

// Удалить пользователя по id
exports.delete = (req, res) => {
    const id = req.params.id;

    User.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Пользователь успешно удален"
                });
            } else {
                res.send({
                    message: `Не удалось удалить пользователя с id=${id}`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: `Ошибка при удалении пользователя с id=${id}`
            });
        });
};

// Удалить всех пользователей
exports.deleteAll = (req, res) => {
    User.destroy({
        where: {},
        truncate: false
    })
        .then(nums => {
            res.send({ message: `${nums} пользователей успешно удалены` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при удалении всех пользователей"
            });
        });
};

// Получить активных пользователей (с > 5 транзакциями)
exports.getActiveUsers = async (req, res) => {
    try {
        const minTransactions = parseInt(req.query.min) || 5;
        const result = await db.sequelize.query(
            `SELECT 
                u.id,
                u.name,
                u.email,
                COUNT(t.id) as transaction_count,
                SUM(t.amount) as total_volume
             FROM users u
             INNER JOIN transactions t ON u.id = t.user_id
             GROUP BY u.id, u.name, u.email
             HAVING COUNT(t.id) > :minTransactions
             ORDER BY transaction_count DESC`,
            {
                replacements: { minTransactions: minTransactions },
                type: db.Sequelize.QueryTypes.SELECT
            }
        );
        
        res.json(result);
    } catch (error) {
        res.status(500).json({
            error: 'Ошибка при получении активных пользователей',
            details: error.message
        });
    }
};

// Получить сводку транзакций пользователя
exports.getTransactionSummary = async (req, res) => {
    try {
        const userId = req.params.id;
        const result = await db.sequelize.query(
            `SELECT 
                u.id,
                u.name,
                u.email,
                COUNT(t.id) as total_transactions,
                SUM(t.amount) as total_amount,
                AVG(t.rate_used) as avg_rate,
                MIN(t.created_at) as first_transaction,
                MAX(t.created_at) as last_transaction
             FROM users u
             LEFT JOIN transactions t ON u.id = t.user_id
             WHERE u.id = :userId
             GROUP BY u.id, u.name, u.email`,
            {
                replacements: { userId: userId },
                type: db.Sequelize.QueryTypes.SELECT
            }
        );
        
        if (result.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        
        res.json(result[0]);
    } catch (error) {
        res.status(500).json({
            error: 'Ошибка при получении сводки транзакций',
            details: error.message
        });
    }
};