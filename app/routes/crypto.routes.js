const express = require("express");
const router = express.Router();
const cryptoController = require("../controllers/crypto.controller");

/**
 * @swagger
 * components:
 *   schemas:
 *     CryptoCurrency:
 *       type: object
 *       required:
 *         - symbol
 *         - name
 *         - current_price_usd
 *       properties:
 *         id:
 *           type: integer
 *           description: Уникальный идентификатор криптовалюты
 *           example: 1
 *         symbol:
 *           type: string
 *           description: Символ криптовалюты
 *           example: "BTC"
 *         name:
 *           type: string
 *           description: Название криптовалюты
 *           example: "Bitcoin"
 *         current_price_usd:
 *           type: number
 *           format: decimal
 *           description: Текущая цена в USD
 *           example: 42150.50
 *         market_cap:
 *           type: integer
 *           description: Рыночная капитализация
 *           example: 822000000000
 *         price_change_24h:
 *           type: number
 *           format: decimal
 *           description: Изменение цены за 24 часа в процентах
 *           example: 2.45
 *         volume_24h:
 *           type: integer
 *           description: Объем торгов за 24 часа
 *           example: 25000000000
 *         last_updated:
 *           type: string
 *           format: date-time
 *           description: Дата последнего обновления
 */

/**
 * @swagger
 * /api/crypto:
 *   get:
 *     tags: [Crypto]
 *     summary: Получить список всех криптовалют
 *     description: Возвращает список всех криптовалют в системе
 *     responses:
 *       200:
 *         description: Список криптовалют успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CryptoCurrency'
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", cryptoController.findAll);

/**
 * @swagger
 * /api/crypto:
 *   post:
 *     tags: [Crypto]
 *     summary: Создать новую криптовалюту
 *     description: Создает новую криптовалюту в системе
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CryptoCurrency'
 *     responses:
 *       201:
 *         description: Криптовалюта успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CryptoCurrency'
 *       400:
 *         description: Ошибка валидации
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", cryptoController.create);

/**
 * @swagger
 * /api/crypto/refresh/rates:
 *   get:
 *     tags: [Crypto]
 *     summary: Обновить цены криптовалют
 *     description: Обновить цены криптовалют из внешнего API CoinGecko
 *     responses:
 *       200:
 *         description: Цены успешно обновлены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 cryptos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CryptoCurrency'
 *       500:
 *         description: Ошибка при обновлении
 */
router.get("/refresh/rates", cryptoController.refreshRates);

/**
 * @swagger
 * /api/crypto/top-gainers:
 *   get:
 *     tags: [Crypto]
 *     summary: Получить топ растущих криптовалют
 *     description: Возвращает топ-3 криптовалюты с наибольшим ростом за 24 часа
 *     responses:
 *       200:
 *         description: Список топ растущих криптовалют
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   symbol:
 *                     type: string
 *                   name:
 *                     type: string
 *                   current_price_usd:
 *                     type: number
 *                   price_change_24h:
 *                     type: number
 *                   market_cap:
 *                     type: integer
 *       500:
 *         description: Ошибка сервера
 */
router.get("/top-gainers", cryptoController.getTopGainers);

/**
 * @swagger
 * /api/crypto/volatile:
 *   get:
 *     tags: [Crypto]
 *     summary: Получить волатильные криптовалюты
 *     description: Возвращает криптовалюты с изменением цены более указанного порога (по умолчанию 5%)
 *     parameters:
 *       - in: query
 *         name: threshold
 *         schema:
 *           type: number
 *         description: Порог волатильности в процентах
 *         example: 5
 *     responses:
 *       200:
 *         description: Список волатильных криптовалют
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   symbol:
 *                     type: string
 *                   name:
 *                     type: string
 *                   current_price_usd:
 *                     type: number
 *                   volatility:
 *                     type: number
 *                   price_change_24h:
 *                     type: number
 *       500:
 *         description: Ошибка сервера
 */
router.get("/volatile", cryptoController.getVolatileCryptos);

/**
 * @swagger
 * /api/crypto:
 *   delete:
 *     tags: [Crypto]
 *     summary: Удалить все криптовалюты
 *     description: Удаляет все криптовалюты из системы
 *     responses:
 *       200:
 *         description: Криптовалюты успешно удалены
 *       500:
 *         description: Ошибка сервера
 */
router.delete("/", cryptoController.deleteAll);

/**
 * @swagger
 * /api/crypto/{id}:
 *   get:
 *     tags: [Crypto]
 *     summary: Получить криптовалюту по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Криптовалюта найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CryptoCurrency'
 *       404:
 *         description: Криптовалюта не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.get("/:id", cryptoController.findOne);

/**
 * @swagger
 * /api/crypto/{id}:
 *   put:
 *     tags: [Crypto]
 *     summary: Обновить криптовалюту
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
 *             $ref: '#/components/schemas/CryptoCurrency'
 *     responses:
 *       200:
 *         description: Криптовалюта успешно обновлена
 *       404:
 *         description: Криптовалюта не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.put("/:id", cryptoController.update);

/**
 * @swagger
 * /api/crypto/{id}:
 *   delete:
 *     tags: [Crypto]
 *     summary: Удалить криптовалюту
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Криптовалюта успешно удалена
 *       404:
 *         description: Криптовалюта не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.delete("/:id", cryptoController.delete);

module.exports = router;
