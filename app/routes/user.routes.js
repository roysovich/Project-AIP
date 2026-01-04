const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: Уникальный идентификатор пользователя
 *         name:
 *           type: string
 *           description: Имя пользователя
 *           example: "Иван Иванов"
 *         email:
 *           type: string
 *           format: email
 *           description: Email пользователя
 *           example: "ivan@example.com"
 *         phone:
 *           type: string
 *           description: Телефон пользователя
 *           example: "+79001234567"
 *         preferred_currency:
 *           type: string
 *           description: Предпочитаемая валюта
 *           example: "RUB"
 */

/**
 * @swagger
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: Получить список всех пользователей
 *     description: Возвращает список всех пользователей в системе
 *     responses:
 *       200:
 *         description: Список пользователей успешно получен
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       500:
 *         description: Ошибка сервера
 */
router.get("/", userController.findAll);

/**
 * @swagger
 * /api/users:
 *   post:
 *     tags: [Users]
 *     summary: Создать нового пользователя
 *     description: Создает нового пользователя в системе
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: Пользователь успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Ошибка валидации
 *       500:
 *         description: Ошибка сервера
 */
router.post("/", userController.create);
/**
 * @swagger
 * /api/users/active:
 *   get:
 *     tags: [Users]
 *     summary: Получить активных пользователей
 *     description: Возвращает пользователей с количеством транзакций больше указанного порога (по умолчанию 5)
 *     parameters:
 *       - in: query
 *         name: min
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Минимальное количество транзакций
 *     responses:
 *       200:
 *         description: Список активных пользователей
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   email:
 *                     type: string
 *                   transaction_count:
 *                     type: integer
 *                   total_volume:
 *                     type: number
 *       500:
 *         description: Ошибка сервера
 */
router.get("/active", userController.getActiveUsers);

/**
 * @swagger
 * /api/users:
 *   delete:
 *     tags: [Users]
 *     summary: Удалить всех пользователей
 *     description: Удаляет всех пользователей из системы
 *     responses:
 *       200:
 *         description: Пользователи успешно удалены
 *       500:
 *         description: Ошибка сервера
 */
router.delete("/", userController.deleteAll);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Получить пользователя по ID
 *     description: Возвращает информацию о пользователе по его идентификатору
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *         example: 1
 *     responses:
 *       200:
 *         description: Пользователь найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка сервера
 */
router.get("/:id", userController.findOne);

/**
 * @swagger
 * /api/users/{id}/transaction-summary:
 *   get:
 *     tags: [Users]
 *     summary: Получить сводку транзакций пользователя
 *     description: Возвращает статистику по транзакциям для указанного пользователя
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *         example: 1
 *     responses:
 *       200:
 *         description: Сводка получена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 total_transactions:
 *                   type: integer
 *                 total_amount:
 *                   type: number
 *                 avg_rate:
 *                   type: number
 *                 first_transaction:
 *                   type: string
 *                   format: date-time
 *                 last_transaction:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка сервера
 */
router.get("/:id/transaction-summary", userController.getTransactionSummary);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Обновить пользователя
 *     description: Обновляет информацию о пользователе
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: Пользователь успешно обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Пользователь успешно обновлен"
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка сервера
 */
router.put("/:id", userController.update);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [Users]
 *     summary: Удалить пользователя
 *     description: Удаляет пользователя по его идентификатору
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пользователя
 *         example: 1
 *     responses:
 *       200:
 *         description: Пользователь успешно удален
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Пользователь успешно удален"
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Ошибка сервера
 */
router.delete("/:id", userController.delete);

module.exports = router;
