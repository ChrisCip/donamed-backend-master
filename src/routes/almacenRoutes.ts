import { Router } from 'express';
import almacenController from '../controllers/almacenController.js';

const router = Router();

// ==========================================================
// ALMACENES
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/almacenes:
 *   get:
 *     summary: Listar almacenes
 *     tags: [Admin - Almacenes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de almacenes
 *   post:
 *     summary: Crear almacén
 *     tags: [Admin - Almacenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - telefono
 *               - correo
 *             properties:
 *               nombre:
 *                 type: string
 *               codigociudad:
 *                 type: string
 *               direccion:
 *                 type: string
 *               telefono:
 *                 type: string
 *               correo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Almacén creado
 */
router.get('/almacenes', almacenController.getAlmacenes);
router.post('/almacenes', almacenController.createAlmacen);

/**
 * @swagger
 * /api/v1/admin/almacenes/{id}:
 *   get:
 *     summary: Obtener almacén por ID
 *     tags: [Admin - Almacenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Almacén encontrado
 *       404:
 *         description: Almacén no encontrado
 *   put:
 *     summary: Actualizar almacén
 *     tags: [Admin - Almacenes]
 *     security:
 *       - bearerAuth: []
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
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               codigociudad:
 *                 type: string
 *               direccion:
 *                 type: string
 *               telefono:
 *                 type: string
 *               correo:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO]
 *     responses:
 *       200:
 *         description: Almacén actualizado
 *       404:
 *         description: Almacén no encontrado
 *   delete:
 *     summary: Eliminar almacén
 *     tags: [Admin - Almacenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Almacén eliminado
 *       404:
 *         description: Almacén no encontrado
 */
router.get('/almacenes/:id', almacenController.getAlmacenById);
router.put('/almacenes/:id', almacenController.updateAlmacen);
router.delete('/almacenes/:id', almacenController.deleteAlmacen);

export default router;
