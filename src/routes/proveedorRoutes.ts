import { Router } from 'express';
import proveedorController from '../controllers/proveedorController.js';

const router = Router();

// ==========================================================
// PROVEEDORES - ENDPOINT INDEPENDIENTE
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/proveedores:
 *   get:
 *     summary: Listar todos los proveedores
 *     description: Obtiene la lista de proveedores con paginación y búsqueda
 *     tags: [Admin - Proveedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Cantidad de registros por página
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre o RNC
 *     responses:
 *       200:
 *         description: Lista de proveedores
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Proveedor'
 *                 pagination:
 *                   type: object
 *   post:
 *     summary: Crear un nuevo proveedor
 *     tags: [Admin - Proveedores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rncproveedor
 *               - nombre
 *             properties:
 *               rncproveedor:
 *                 type: string
 *                 description: RNC (9 dígitos) o cédula (11 dígitos)
 *                 example: "123456789"
 *               nombre:
 *                 type: string
 *                 description: Nombre del proveedor
 *               telefono:
 *                 type: string
 *               correo:
 *                 type: string
 *               codigociudad:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       201:
 *         description: Proveedor creado exitosamente
 *       400:
 *         description: RNC inválido
 *       409:
 *         description: Ya existe un proveedor con este RNC
 */
router.get('/', proveedorController.getProveedores);
router.post('/', proveedorController.createProveedor);

/**
 * @swagger
 * /api/v1/admin/proveedores/{id}:
 *   get:
 *     summary: Obtener detalle de un proveedor
 *     tags: [Admin - Proveedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: RNC del proveedor
 *     responses:
 *       200:
 *         description: Detalle del proveedor con historial de donaciones
 *       404:
 *         description: Proveedor no encontrado
 *   put:
 *     summary: Actualizar un proveedor
 *     tags: [Admin - Proveedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: RNC del proveedor
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               telefono:
 *                 type: string
 *               correo:
 *                 type: string
 *               codigociudad:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Proveedor actualizado
 *       404:
 *         description: Proveedor no encontrado
 *   delete:
 *     summary: Eliminar un proveedor
 *     tags: [Admin - Proveedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: RNC del proveedor
 *     responses:
 *       200:
 *         description: Proveedor eliminado
 *       400:
 *         description: No se puede eliminar (tiene donaciones asociadas)
 *       404:
 *         description: Proveedor no encontrado
 */
router.get('/:id', proveedorController.getProveedorById);
router.put('/:id', proveedorController.updateProveedor);
router.delete('/:id', proveedorController.deleteProveedor);

/**
 * @swagger
 * /api/v1/admin/proveedores/{id}/stats:
 *   get:
 *     summary: Obtener estadísticas de un proveedor
 *     tags: [Admin - Proveedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: RNC del proveedor
 *     responses:
 *       200:
 *         description: Estadísticas del proveedor
 *       404:
 *         description: Proveedor no encontrado
 */
router.get('/:id/stats', proveedorController.getProveedorStats);

export default router;
