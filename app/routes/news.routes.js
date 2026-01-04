const express = require("express");
const router = express.Router();
const newsController = require("../controllers/news.controller");

/**
 * @swagger
 * components:
 *   schemas:
 *     NewsArticle:
 *       type: object
 *       required:
 *         - title
 *         - url
 *         - source
 *         - published_at
 *       properties:
 *         id:
 *           type: integer
 *           description: Уникальный идентификатор новости
 *         title:
 *           type: string
 *           description: Заголовок новости
 *           example: "Федеральная резервная система сохранила процентную ставку"
 *         description:
 *           type: string
 *           description: Описание новости
 *         url:
 *           type: string
 *           description: URL новости
 *           example: "https://example.com/news1"
 *         source:
 *           type: string
 *           description: Источник новости
 *           example: "Financial Times"
 *         image_url:
 *           type: string
 *           description: URL изображения
 *         published_at:
 *           type: string
 *           format: date-time
 *           description: Дата публикации
 *         category:
 *           type: string
 *           description: Категория новости
 *           example: "monetary-policy"
 */

/**
 * @swagger
 * /api/news:
 *   get:
 *     tags: [News]
 *     summary: Получить список всех новостей
 *     description: Возвращает список всех новостей в системе
 *     responses:
 *       200:
 *         description: Список новостей успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NewsArticle'
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", newsController.findAll);

/**
 * @swagger
 * /api/news:
 *   post:
 *     tags: [News]
 *     summary: Создать новую новость
 *     description: Создает новую новость в системе
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/NewsArticle'
 *     responses:
 *       201:
 *         description: Новость успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NewsArticle'
 *       400:
 *         description: Ошибка валидации
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", newsController.create);

/**
 * @swagger
 * /api/news/refresh:
 *   get:
 *     tags: [News]
 *     summary: Обновить новости (mock)
 *     description: Добавить новые mock новости в систему
 *     responses:
 *       200:
 *         description: Новости успешно обновлены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 news:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NewsArticle'
 *       500:
 *         description: Ошибка сервера
 */
router.get("/refresh", newsController.refreshNews);

/**
 * @swagger
 * /api/news/latest/{category}:
 *   get:
 *     tags: [News]
 *     summary: Получить последние новости по категории
 *     description: Возвращает последние новости по указанной категории (forex, cryptocurrency, stocks, monetary-policy, commodities)
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Категория новостей
 *         example: "cryptocurrency"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Количество новостей
 *     responses:
 *       200:
 *         description: Список новостей получен
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NewsArticle'
 *       500:
 *         description: Ошибка сервера
 */
router.get("/latest/:category", newsController.getLatestByCategory);

/**
 * @swagger
 * /api/news:
 *   delete:
 *     tags: [News]
 *     summary: Удалить все новости
 *     description: Удаляет все новости из системы
 *     responses:
 *       200:
 *         description: Новости успешно удалены
 *       500:
 *         description: Ошибка сервера
 */
router.delete("/", newsController.deleteAll);

/**
 * @swagger
 * /api/news/{id}:
 *   get:
 *     tags: [News]
 *     summary: Получить новость по ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Новость найдена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NewsArticle'
 *       404:
 *         description: Новость не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.get("/:id", newsController.findOne);

/**
 * @swagger
 * /api/news/{id}:
 *   put:
 *     tags: [News]
 *     summary: Обновить новость
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
 *             $ref: '#/components/schemas/NewsArticle'
 *     responses:
 *       200:
 *         description: Новость успешно обновлена
 *       404:
 *         description: Новость не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.put("/:id", newsController.update);

/**
 * @swagger
 * /api/news/{id}:
 *   delete:
 *     tags: [News]
 *     summary: Удалить новость
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Новость успешно удалена
 *       404:
 *         description: Новость не найдена
 *       500:
 *         description: Ошибка сервера
 */
router.delete("/:id", newsController.delete);

module.exports = router;
