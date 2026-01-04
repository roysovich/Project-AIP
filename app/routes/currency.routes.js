const express = require("express");
const router = express.Router();
const currencyController = require("../controllers/currency.controller");

/**
 * @swagger
 * components:
 *   schemas:
 *     Currency:
 *       type: object
 *       required:
 *         - code
 *         - name
 *         - rate_to_usd
 *       properties:
 *         id:
 *           type: integer
 *           description: Уникальный идентификатор валюты
 *           example: 1
 *         code:
 *           type: string
 *           description: Код валюты (ISO 4217)
 *           example: "USD"
 *         name:
 *           type: string
 *           description: Название валюты
 *           example: "US Dollar"
 *         symbol:
 *           type: string
 *           description: Символ валюты
 *           example: "$"
 *         rate_to_usd:
 *           type: number
 *           format: decimal
 *           description: Курс к USD
 *           example: 1.0
 *         last_updated:
 *           type: string
 *           format: date-time
 *           description: Дата последнего обновления
 *           example: "2024-12-08T10:00:00Z"
 */

/**
 * @swagger
 * /api/currencies:
 *   get:
 *     tags: [Currency]
 *     summary: Получить список всех валют
 *     description: Возвращает список всех валют в системе
 *     responses:
 *       200:
 *         description: Список валют успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Currency'
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", currencyController.findAll);

/**
 * @swagger
 * /api/currencies/paged:
 *   get:
 *     tags: [Currency]
 *     summary: Получить валюты с пагинацией
 *     description: Возвращает список валют с поддержкой пагинации
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Номер страницы
 *         example: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Размер страницы
 *         example: 10
 *       - in: query
 *         name: code
 *         schema:
 *           type: string
 *         description: Фильтр по коду валюты
 *         example: "USD"
 *     responses:
 *       200:
 *         description: Список валют с пагинацией
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalItems:
 *                   type: integer
 *                   description: Общее количество валют
 *                 totalPages:
 *                   type: integer
 *                   description: Общее количество страниц
 *                 currentPage:
 *                   type: integer
 *                   description: Текущая страница
 *                 items:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Currency'
 *       500:
 *         description: Ошибка сервера
 */
router.get("/paged", currencyController.findAllPaged);

/**
 * @swagger
 * /api/currencies:
 *   post:
 *     tags: [Currency]
 *     summary: Создать новую валюту
 *     description: Создает новую валюту в системе
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Currency'
 *           example:
 *             code: "EUR"
 *             name: "Euro"
 *             symbol: "€"
 *             rate_to_usd: 1.09
 *     responses:
 *       201:
 *         description: Валюта успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Currency'
 *       400:
 *         description: Ошибка валидации
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", currencyController.create);

/**
 * @swagger
 * /api/currencies/refresh/rates:
 *   get:
 *     tags: [Currency]
 *     summary: Обновить курсы валют из внешнего API
 *     description: Запрашивает актуальные курсы валют с exchangerate-api.com и обновляет их в базе данных
 *     responses:
 *       200:
 *         description: Курсы успешно обновлены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 'Курсы валют обновлены'
 *                 currencies:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Currency'
 *       500:
 *         description: Ошибка при обновлении курсов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: 'Ошибка при обновлении курсов валют'
 */
router.get("/refresh/rates", currencyController.refreshRates);

/**
 * @swagger
 * /api/currencies/stats:
 *   get:
 *     tags: [Currency]
 *     summary: Получить статистику по валютам
 *     description: Статистика использования валют в транзакциях
 *     responses:
 *       200:
 *         description: Статистика успешно получена
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                   name:
 *                     type: string
 *                   transaction_count:
 *                     type: integer
 *                   avg_rate:
 *                     type: number
 *                   last_updated:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Ошибка сервера
 */
router.get("/stats", currencyController.getCurrencyStats);

/**
 * @swagger
 * /api/currencies/highest-rate:
 *   get:
 *     tags: [Currency]
 *     summary: Найти валюту с наивысшим курсом
 *     description: Возвращает валюту с максимальным курсом к USD
 *     responses:
 *       200:
 *         description: Валюта найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Currency'
 *       404:
 *         description: Валюты не найдены
 *       500:
 *         description: Ошибка сервера
 */
router.get("/highest-rate", currencyController.getCurrencyWithHighestRate);

/**
 * @swagger
 * /api/currencies/popular:
 *   get:
 *     tags: [Currency]
 *     summary: Получить популярные валюты
 *     description: Возвращает топ-10 самых используемых валют в транзакциях
 *     responses:
 *       200:
 *         description: Список популярных валют
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   code:
 *                     type: string
 *                   name:
 *                     type: string
 *                   symbol:
 *                     type: string
 *                   usage_count:
 *                     type: integer
 *       500:
 *         description: Ошибка сервера
 */
router.get("/popular", currencyController.getPopularCurrencies);

/**
 * @swagger
 * /api/currencies/cross-rates:
 *   get:
 *     tags: [Currency]
 *     summary: Рассчитать кросс-курс между валютами
 *     description: Рассчитывает курс конвертации между двумя валютами
 *     parameters:
 *       - in: query
 *         name: from
 *         required: true
 *         schema:
 *           type: string
 *         description: Код исходной валюты
 *         example: "USD"
 *       - in: query
 *         name: to
 *         required: true
 *         schema:
 *           type: string
 *         description: Код целевой валюты
 *         example: "EUR"
 *     responses:
 *       200:
 *         description: Кросс-курс рассчитан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 from_currency:
 *                   type: string
 *                 from_rate:
 *                   type: number
 *                 to_currency:
 *                   type: string
 *                 to_rate:
 *                   type: number
 *                 cross_rate:
 *                   type: number
 *       400:
 *         description: Не указаны параметры from и to
 *       404:
 *         description: Валюты не найдены
 *       500:
 *         description: Ошибка сервера
 */
router.get("/cross-rates", currencyController.getCrossRates);

/**
 * @swagger
 * /api/currencies/search/{pattern}:
 *   get:
 *     tags: [Currency]
 *     summary: Поиск валют по паттерну символа
 *     description: Находит валюты, символ которых соответствует паттерну
 *     parameters:
 *       - in: path
 *         name: pattern
 *         required: true
 *         schema:
 *           type: string
 *         description: Паттерн для поиска символа
 *         example: "$"
 *     responses:
 *       200:
 *         description: Список найденных валют
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Currency'
 *       500:
 *         description: Ошибка сервера
 */
router.get("/search/:pattern", currencyController.getCurrenciesBySymbolPattern);

/**
 * @swagger
 * /api/currencies:
 *   delete:
 *     tags: [Currency]
 *     summary: Удалить все валюты
 *     description: Удаляет все валюты из системы
 *     responses:
 *       200:
 *         description: Валюты успешно удалены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "10 валют успешно удалены"
 *       500:
 *         description: Ошибка сервера
 */
router.delete("/", currencyController.deleteAll);

/**
 * @swagger
 * /api/currencies/{id}:
 *   get:
 *     tags: [Currency]
 *     summary: Получить валюту по ID
 *     description: Возвращает информацию о валюте по её идентификатору
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID валюты
 *         example: 1
 *     responses:
 *       200:
 *         description: Валюта найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Currency'
 *       404:
 *         description: Валюта не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.get("/:id", currencyController.findOne);

/**
 * @swagger
 * /api/currencies/{id}/exchange-stats:
 *   get:
 *     tags: [Currency]
 *     summary: Получить статистику обмена для валюты
 *     description: Статистика конвертаций для конкретной валюты
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID валюты
 *         example: 1
 *     responses:
 *       200:
 *         description: Статистика получена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: string
 *                 name:
 *                   type: string
 *                 operation_count:
 *                   type: integer
 *                 total_amount:
 *                   type: number
 *                 avg_rate:
 *                   type: number
 *       404:
 *         description: Валюта не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.get("/:id/exchange-stats", currencyController.getCurrencyExchangeStats);

/**
 * @swagger
 * /api/currencies/{id}:
 *   put:
 *     tags: [Currency]
 *     summary: Обновить валюту
 *     description: Обновляет информацию о валюте
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID валюты
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Currency'
 *     responses:
 *       200:
 *         description: Валюта успешно обновлена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Валюта успешно обновлена"
 *       404:
 *         description: Валюта не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.put("/:id", currencyController.update);

/**
 * @swagger
 * /api/currencies/{id}:
 *   delete:
 *     tags: [Currency]
 *     summary: Удалить валюту
 *     description: Удаляет валюту по её идентификатору
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID валюты
 *         example: 1
 *     responses:
 *       200:
 *         description: Валюта успешно удалена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Валюта успешно удалена"
 *       404:
 *         description: Валюта не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.delete("/:id", currencyController.delete);

module.exports = router;
