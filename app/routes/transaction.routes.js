const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transaction.controller");

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - user_id
 *         - from_currency
 *         - to_currency
 *         - amount
 *       properties:
 *         id:
 *           type: integer
 *           description: Уникальный идентификатор транзакции
 *         user_id:
 *           type: integer
 *           description: ID пользователя
 *         from_currency:
 *           type: string
 *           description: Исходная валюта
 *           example: "USD"
 *         to_currency:
 *           type: string
 *           description: Целевая валюта
 *           example: "EUR"
 *         amount:
 *           type: number
 *           description: Сумма для конвертации
 *           example: 100
 *         converted_amount:
 *           type: number
 *           description: Конвертированная сумма
 *           example: 91.74
 *         rate_used:
 *           type: number
 *           description: Использованный курс
 *           example: 0.9174
 *         status:
 *           type: string
 *           description: Статус транзакции
 *           example: "completed"
 *         created_at:
 *           type: string
 *           format: date-time
 *     ConvertRequest:
 *       type: object
 *       required:
 *         - from
 *         - to
 *         - amount
 *       properties:
 *         from:
 *           type: string
 *           description: Код исходной валюты
 *           example: "USD"
 *         to:
 *           type: string
 *           description: Код целевой валюты
 *           example: "EUR"
 *         amount:
 *           type: number
 *           description: Сумма для конвертации
 *           example: 100
 *         user_id:
 *           type: integer
 *           description: ID пользователя (опционально)
 *           example: 1
 */

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     tags: [Transactions]
 *     summary: Получить список всех транзакций
 *     description: Возвращает список всех транзакций в системе
 *     responses:
 *       200:
 *         description: Список транзакций успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Transaction'
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", transactionController.findAll);

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     tags: [Transactions]
 *     summary: Создать новую транзакцию
 *     description: Создает новую транзакцию в системе
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       201:
 *         description: Транзакция успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Ошибка валидации
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", transactionController.create);

/**
 * @swagger
 * /api/transactions/convert:
 *   post:
 *     tags: [Calculator]
 *     summary: Конвертировать валюты
 *     description: Конвертирует сумму из одной валюты в другую. Поддерживает фиатные валюты и криптовалюты.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConvertRequest'
 *           example:
 *             from: "USD"
 *             to: "EUR"
 *             amount: 100
 *             user_id: 1
 *     responses:
 *       200:
 *         description: Конвертация выполнена успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 from:
 *                   type: string
 *                 to:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 converted_amount:
 *                   type: number
 *                 rate:
 *                   type: number
 *                 is_crypto:
 *                   type: boolean
 *       400:
 *         description: Ошибка валидации
 *       404:
 *         description: Валюта не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.post("/convert", transactionController.convert);

/**
 * @swagger
 * /api/transactions/daily-summary:
 *   get:
 *     tags: [Transactions]
 *     summary: Получить дневную сводку
 *     description: Возвращает сводку операций за указанный день
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Дата в формате YYYY-MM-DD (по умолчанию текущая дата)
 *         example: "2024-12-08"
 *     responses:
 *       200:
 *         description: Сводка получена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 date:
 *                   type: string
 *                 total_transactions:
 *                   type: integer
 *                 total_amount:
 *                   type: number
 *                 avg_rate:
 *                   type: number
 *                 unique_users:
 *                   type: integer
 *       500:
 *         description: Ошибка сервера
 */
router.get("/daily-summary", transactionController.getDailySummary);

/**
 * @swagger
 * /api/transactions/conversion-volume:
 *   get:
 *     tags: [Transactions]
 *     summary: Получить объем конвертаций
 *     description: Возвращает объем конвертаций по валютам
 *     responses:
 *       200:
 *         description: Объем конвертаций получен
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   from_currency:
 *                     type: string
 *                   to_currency:
 *                     type: string
 *                   transaction_count:
 *                     type: integer
 *                   total_volume:
 *                     type: number
 *                   avg_rate:
 *                     type: number
 *       500:
 *         description: Ошибка сервера
 */
router.get("/conversion-volume", transactionController.getConversionVolume);

/**
 * @swagger
 * /api/transactions/user/{userId}/history:
 *   get:
 *     tags: [Transactions]
 *     summary: Получить историю конвертаций пользователя
 *     description: Возвращает историю всех конвертаций для указанного пользователя
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *         example: 1
 *     responses:
 *       200:
 *         description: История получена
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   from_currency:
 *                     type: string
 *                   to_currency:
 *                     type: string
 *                   amount:
 *                     type: number
 *                   converted_amount:
 *                     type: number
 *                   rate_used:
 *                     type: number
 *                   created_at:
 *                     type: string
 *                     format: date-time
 *                   user_name:
 *                     type: string
 *       500:
 *         description: Ошибка сервера
 */
router.get("/user/:userId/history", transactionController.getUserConversionHistory);

/**
 * @swagger
 * /api/transactions:
 *   delete:
 *     tags: [Transactions]
 *     summary: Удалить все транзакции
 *     description: Удаляет все транзакции из системы
 *     responses:
 *       200:
 *         description: Транзакции успешно удалены
 *       500:
 *         description: Ошибка сервера
 */
router.delete("/", transactionController.deleteAll);

/**
 * @swagger
 * /api/transactions/{id}:
 *   get:
 *     tags: [Transactions]
 *     summary: Получить транзакцию по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Транзакция найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Транзакция не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.get("/:id", transactionController.findOne);

/**
 * @swagger
 * /api/transactions/{id}:
 *   put:
 *     tags: [Transactions]
 *     summary: Обновить транзакцию
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       200:
 *         description: Транзакция успешно обновлена
 *       404:
 *         description: Транзакция не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.put("/:id", transactionController.update);

/**
 * @swagger
 * /api/transactions/{id}:
 *   delete:
 *     tags: [Transactions]
 *     summary: Удалить транзакцию
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Транзакция успешно удалена
 *       404:
 *         description: Транзакция не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.delete("/:id", transactionController.delete);

module.exports = router;
