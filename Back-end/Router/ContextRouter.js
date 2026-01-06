const express = require('express');
const router = express.Router();
const ContextController = require('../Controller/ContextController');
const { authenticationToken, verifyAdmin } = require('../Middleware/auth'); 

/**
 * @swagger
 * tags:
 *   - name: Contexts
 *     description: 'API quản lý ngữ cảnh (Context & Moods) - Bao gồm logic Override và Forking'
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     ContextResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: '6568a123...'
 *         name:
 *           type: string
 *           example: 'Làm việc tập trung'
 *         icon:
 *           type: string
 *           example: 'Work.svg'
 *         color:
 *           type: string
 *           example: '#FFFFFF'
 *         moods:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               name:
 *                 type: string
 *               displayName:
 *                 type: string
 *               icon:
 *                 type: string
 *               colorCode:
 *                 type: string
 *               ownerId:
 *                 type: string
 *                 nullable: true
 *                 description: 'null là của Admin, có ID là của User'
 *               isSystem:
 *                 type: boolean
 *                 example: true
 *               forkedFrom:
 *                 type: string
 *                 nullable: true
 *                 description: 'ID của context gốc nếu đây là bản sao'
 *         createdAt:
 *           type: string
 *           format: date-time
 */

// ==================================================================
// 1. ADMIN - GET ALL
// ==================================================================
/**
 * @swagger
 * /api/context/all/admin:
 *   get:
 *     summary: (Admin) Lấy toàn bộ Context hệ thống
 *     description: Trả về danh sách các Context gốc do Admin tạo (isSystem = true).
 *     tags:
 *       - Contexts
 *     responses:
 *       '200':
 *         description: Thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 count:
 *                   type: integer
 *                 contextData:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ContextResponse'
 *       '500':
 *         description: Lỗi server
 */
router.get('/all/admin', ContextController.getAdminContexts);

// ==================================================================
// 2. GET DETAIL
// ==================================================================
/**
 * @swagger
 * /api/context/choose/{id}:
 *   get:
 *     summary: Lấy chi tiết một Context
 *     tags:
 *       - Contexts
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID của Context
 *     responses:
 *       '200':
 *         description: Thông tin chi tiết context
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 Id:
 *                   type: string
 *                 contextData:
 *                   $ref: '#/components/schemas/ContextResponse'
 *       '404':
 *         description: Không tìm thấy context
 */
router.get('/choose/:id', ContextController.getContextById);

// ==================================================================
// 3. USER - GET OWN CONTEXTS
// ==================================================================
/**
 * @swagger
 * /api/context/all:
 *   get:
 *     summary: (User) Lấy các Context riêng của User
 *     description: Chỉ lấy các context do user tự tạo hoặc đã forked (trừ context hệ thống). Yêu cầu Login.
 *     tags:
 *       - Contexts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Danh sách context cá nhân
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 contextData:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ContextResponse'
 *       '401':
 *         description: Chưa đăng nhập
 */
router.get('/all', authenticationToken, ContextController.getUserContexts);

// ==================================================================
// 4. ADMIN - ADD SYSTEM CONTEXT
// ==================================================================
/**
 * @swagger
 * /api/context/add-context/admin:
 *   post:
 *     summary: (Admin) Thêm Context hệ thống mới
 *     description: Tạo context chung cho toàn bộ user (isSystem=true). Yêu cầu quyền Admin.
 *     tags:
 *       - Contexts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - moods
 *             properties:
 *               name:
 *                 type: string
 *                 example: 'Chill Lofi'
 *               icon:
 *                 type: string
 *                 example: 'Headphone.svg'
 *               color:
 *                 type: string
 *                 example: '#FFD700'
 *               moods:
 *                 type: array
 *                 description: Mảng các Mood ID (tối thiểu 3)
 *                 items:
 *                   type: string
 *                   example: '6568a123...'
 *     responses:
 *       '201':
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 contextData:
 *                   $ref: '#/components/schemas/ContextResponse'
 *       '403':
 *         description: Không phải Admin
 */
router.post('/add-context/admin', authenticationToken, verifyAdmin, ContextController.addSystemContext);

// ==================================================================
// 5. UPDATE CONTEXT
// ==================================================================
/**
 * @swagger
 * /api/context/update/{contextId}:
 *   put:
 *     summary: Cập nhật thông tin Context
 *     description: >
 *       Logic đặc biệt:
 *       1. Nếu sửa Context cá nhân -> Update trực tiếp.
 *       2. Nếu User thường sửa Context hệ thống -> Tạo bản sao (Fork) và trả về context mới.
 *     tags:
 *       - Contexts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contextId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *               moods:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       '200':
 *         description: Cập nhật thành công (hoặc đã tạo bản sao)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 contextData:
 *                   $ref: '#/components/schemas/ContextResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/update/:contextId', authenticationToken, ContextController.updateContext);

// ==================================================================
// 6. ADMIN - DELETE
// ==================================================================
/**
 * @swagger
 * /api/context/del/admin/{contextId}:
 *   delete:
 *     summary: (Admin) Xóa Context bất kỳ
 *     tags:
 *       - Contexts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contextId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Đã xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 deleted_data:
 *                   $ref: '#/components/schemas/ContextResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/del/admin/:contextId', authenticationToken, verifyAdmin, ContextController.deleteContextByAdmin);

// ==================================================================
// 7. USER HOME - GET DISPLAY LIST
// ==================================================================
/**
 * @swagger
 * /api/context/user:
 *   get:
 *     summary: (User) Lấy danh sách Context hiển thị (Home)
 *     description: >
 *       Trả về danh sách kết hợp giữa System và User Context.
 *       Nếu User đã chỉnh sửa (fork) một context hệ thống, bản gốc sẽ bị ẩn đi và thay thế bằng bản của User.
 *     tags:
 *       - Contexts
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: Danh sách hiển thị
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                 contextData:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ContextResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/user', authenticationToken, ContextController.getContextsForUser);

// ==================================================================
// 8. USER - ADD CONTEXT
// ==================================================================
/**
 * @swagger
 * /api/context/add:
 *   post:
 *     summary: (User) User tự tạo Context cá nhân
 *     tags:
 *       - Contexts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - moods
 *             properties:
 *               name:
 *                 type: string
 *               icon:
 *                 type: string
 *               color:
 *                 type: string
 *               moods:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       '201':
 *         description: Tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 contextData:
 *                   $ref: '#/components/schemas/ContextResponse'
 *       '400':
 *         $ref: '#/components/responses/BadRequest'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/add', authenticationToken, ContextController.addUserContext);

// ==================================================================
// 9. USER - PATCH MOOD
// ==================================================================
/**
 * @swagger
 * /api/context/mood-change/{contextId}:
 *   patch:
 *     summary: (User) Chỉ cập nhật danh sách Mood
 *     description: Dùng để tinh chỉnh nhanh mood trong context. Cũng áp dụng logic Forking nếu sửa context gốc.
 *     tags:
 *       - Contexts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contextId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - moods
 *             properties:
 *               moods:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["id_mood_moi_1", "id_mood_moi_2", "id_mood_moi_3"]
 *     responses:
 *       '200':
 *         description: Cập nhật mood thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/ContextResponse'
 *       '401':
 *         $ref: '#/components/responses/Unauthorized'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 */
router.patch('/mood-change/:contextId', authenticationToken, ContextController.updateContextMoods);

// ==================================================================
// ==================================================================
// API 10: USER - DELETE CONTEXT
// ==================================================================
/**
 * @swagger
 * /api/context/user/{contextId}:
 *   delete:
 *     summary: (User) Xóa Context cá nhân
 *     description: >
 *       Xóa một context do user sở hữu (tự tạo hoặc bản sao từ hệ thống).
 *       Lưu ý: Nếu xóa một bản sao (Forked Context), bản gốc của hệ thống sẽ xuất hiện trở lại trong danh sách Home.
 *     tags:
 *       - Contexts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: contextId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của context cần xóa
 *     responses:
 *       '200':
 *         description: Xóa thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Đã xóa ngữ cảnh thành công"
 *                 deletedId:
 *                   type: string
 *                   example: "6568a..."
 *                 isRevertedToSystem:
 *                   type: boolean
 *                   description: true nếu vừa xóa bản sao và hệ thống tự revert về bản gốc
 *       '403':
 *         $ref: '#/components/responses/Forbidden'
 *       '404':
 *         $ref: '#/components/responses/NotFound'
 *       '500':
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/user/:contextId', authenticationToken, ContextController.deleteUserContext);

module.exports = router;