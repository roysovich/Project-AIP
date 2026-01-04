const db = require("../models");
const NewsArticle = db.news;
const Op = db.Sequelize.Op;

// Создание новой новости
exports.create = (req, res) => {
    if (!req.body.title) {
        res.status(400).send({
            message: "Заголовок новости не может быть пустым!"
        });
        return;
    }

    const news = {
        title: req.body.title,
        description: req.body.description,
        url: req.body.url,
        source: req.body.source,
        image_url: req.body.image_url,
        published_at: req.body.published_at || new Date(),
        category: req.body.category
    };

    NewsArticle.create(news)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при создании новости"
            });
        });
};

// Получить все новости
exports.findAll = (req, res) => {
    const title = req.query.title;
    var condition = title ? { title: { [Op.iLike]: `%${title}%` } } : null;

    NewsArticle.findAll({
        where: condition,
        order: [['published_at', 'DESC']],
        limit: 20
    })
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при получении новостей"
            });
        });
};

// Найти новость по id
exports.findOne = (req, res) => {
    const id = req.params.id;

    NewsArticle.findByPk(id)
        .then(data => {
            if (data) {
                res.send(data);
            } else {
                res.status(404).send({
                    message: `Новость с id=${id} не найдена`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: `Ошибка при получении новости с id=${id}`
            });
        });
};

// Обновить новость по id
exports.update = (req, res) => {
    const id = req.params.id;

    NewsArticle.update(req.body, {
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Новость успешно обновлена"
                });
            } else {
                res.send({
                    message: `Не удалось обновить новость с id=${id}`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: `Ошибка при обновлении новости с id=${id}`
            });
        });
};

// Удалить новость по id
exports.delete = (req, res) => {
    const id = req.params.id;

    NewsArticle.destroy({
        where: { id: id }
    })
        .then(num => {
            if (num == 1) {
                res.send({
                    message: "Новость успешно удалена"
                });
            } else {
                res.send({
                    message: `Не удалось удалить новость с id=${id}`
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: `Ошибка при удалении новости с id=${id}`
            });
        });
};

// Удалить все новости
exports.deleteAll = (req, res) => {
    NewsArticle.destroy({
        where: {},
        truncate: false
    })
        .then(nums => {
            res.send({ message: `${nums} новостей успешно удалены` });
        })
        .catch(err => {
            res.status(500).send({
                message: err.message || "Ошибка при удалении всех новостей"
            });
        });
};

// Обновить новости (используем mock данные)
exports.refreshNews = async (req, res) => {
    try {
        // Mock данные для демонстрации
        const mockNews = [
            {
                title: 'Рынки акций показали рост на фоне позитивных данных',
                description: 'Основные фондовые индексы выросли после публикации квартальных отчетов крупных компаний.',
                url: 'https://example.com/news-' + Date.now(),
                source: 'Market Watch',
                published_at: new Date(),
                category: 'stocks'
            },
            {
                title: 'Криптовалютный рынок демонстрирует волатильность',
                description: 'Bitcoin и Ethereum показали значительные колебания цен в течение торговой сессии.',
                url: 'https://example.com/crypto-' + Date.now(),
                source: 'Crypto News',
                published_at: new Date(),
                category: 'cryptocurrency'
            }
        ];

        await NewsArticle.bulkCreate(mockNews);

        const allNews = await NewsArticle.findAll({
            order: [['published_at', 'DESC']],
            limit: 20
        });

        res.json({
            success: true,
            message: 'Новости обновлены',
            news: allNews
        });
    } catch (err) {
        console.error('Error refreshing news:', err);
        res.status(500).json({ error: 'Ошибка при обновлении новостей' });
    }
};

// Получить последние новости по категории
exports.getLatestByCategory = async (req, res) => {
    try {
        const category = req.params.category;
        const limit = parseInt(req.query.limit) || 10;
        
        const result = await db.sequelize.query(
            `SELECT 
                id,
                title,
                description,
                url,
                source,
                published_at,
                category
             FROM news_articles
             WHERE category = :category
             ORDER BY published_at DESC
             LIMIT :limit`,
            {
                replacements: { category: category, limit: limit },
                type: db.Sequelize.QueryTypes.SELECT
            }
        );
        
        res.json(result);
    } catch (error) {
        res.status(500).json({
            error: 'Ошибка при получении новостей по категории',
            details: error.message
        });
    }
};