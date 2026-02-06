import { Router, Request, Response, NextFunction } from 'express';
import medicamentoController from '../controllers/medicamentoController.js';

const router = Router();

// ==========================================================
// MEDICAMENTOS
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/medicamentos:
 *   get:
 *     summary: Listar medicamentos con paginación
 *     tags: [Admin - Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Buscar por nombre, código o compuesto
 *     responses:
 *       200:
 *         description: Lista de medicamentos paginada
 *   post:
 *     summary: Crear medicamento
 *     tags: [Admin - Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - CodigoMedicamento
 *               - nombre
 *             properties:
 *               CodigoMedicamento:
 *                 type: string
 *                 example: "MED-001"
 *               nombre:
 *                 type: string
 *                 example: "Ibuprofeno 400mg"
 *               descripcion:
 *                 type: string
 *               compuesto_principal:
 *                 type: string
 *               IDVia:
 *                 type: integer
 *               IDForma_Farmaceutica:
 *                 type: integer
 *               categorias:
 *                 type: array
 *                 items:
 *                   type: integer
 *               enfermedades:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: Medicamento creado
 */
router.get('/medicamentos', medicamentoController.getMedicamentos);
router.post('/medicamentos', medicamentoController.createMedicamento);

/**
 * @swagger
 * /api/v1/admin/medicamentos/{codigo}:
 *   get:
 *     summary: Obtener detalle de medicamento
 *     tags: [Admin - Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle del medicamento
 *   put:
 *     summary: Actualizar medicamento
 *     tags: [Admin - Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medicamento actualizado
 *   delete:
 *     summary: Eliminar medicamento
 *     tags: [Admin - Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medicamento eliminado
 */
router.get('/medicamentos/:codigo', medicamentoController.getMedicamentoById);
router.put('/medicamentos/:codigo', medicamentoController.updateMedicamento);
router.delete('/medicamentos/:codigo', medicamentoController.deleteMedicamento);

// Aliases en inglés
router.get('/medicines', medicamentoController.getMedicamentos);
router.post('/medicines', medicamentoController.createMedicamento);
router.get('/medicines/:code', (req: Request, res: Response, next: NextFunction) => {
  (req.params as any).codigo = req.params.code;
  medicamentoController.getMedicamentoById(req, res, next);
});
router.put('/medicines/:code', (req: Request, res: Response, next: NextFunction) => {
  (req.params as any).codigo = req.params.code;
  medicamentoController.updateMedicamento(req, res, next);
});
router.delete('/medicines/:code', (req: Request, res: Response, next: NextFunction) => {
  (req.params as any).codigo = req.params.code;
  medicamentoController.deleteMedicamento(req, res, next);
});

// ==========================================================
// LOTES
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/lotes:
 *   get:
 *     summary: Listar lotes
 *     tags: [Admin - Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: medicamento
 *         schema:
 *           type: string
 *         description: Filtrar por medicamento
 *       - in: query
 *         name: vencidos
 *         schema:
 *           type: boolean
 *         description: Filtrar por vencidos/no vencidos
 *     responses:
 *       200:
 *         description: Lista de lotes
 *   post:
 *     summary: Crear lote
 *     tags: [Admin - Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigolote
 *               - codigomedicamento
 *               - fechavencimiento
 *             properties:
 *               codigolote:
 *                 type: string
 *               codigomedicamento:
 *                 type: string
 *               fechavencimiento:
 *                 type: string
 *                 format: date
 *               fechafabricacion:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Lote creado
 */
router.get('/lotes', medicamentoController.getLotes);
router.post('/lotes', medicamentoController.createLote);
router.delete('/lotes/:id', medicamentoController.deleteLote);

// ==========================================================
// INVENTARIO
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/inventario:
 *   get:
 *     summary: Ver inventario
 *     tags: [Admin - Almacenes e Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: almacen
 *         schema:
 *           type: integer
 *         description: Filtrar por almacén
 *       - in: query
 *         name: medicamento
 *         schema:
 *           type: string
 *         description: Filtrar por medicamento
 *     responses:
 *       200:
 *         description: Lista de inventario
 *   post:
 *     summary: Ajustar inventario
 *     tags: [Admin - Almacenes e Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - idalmacen
 *               - codigolote
 *               - codigomedicamento
 *               - cantidad
 *             properties:
 *               idalmacen:
 *                 type: integer
 *               codigolote:
 *                 type: string
 *               codigomedicamento:
 *                 type: string
 *               cantidad:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Inventario ajustado
 */
router.get('/inventario', medicamentoController.getInventario);
router.post('/inventario', medicamentoController.ajustarInventario);

// ==========================================================
// INVENTORY BATCHES Y STOCK
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/inventory/batches:
 *   get:
 *     summary: Ver lotes con filtros
 *     tags: [Admin - Almacenes e Inventario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de lotes
 */
router.get('/inventory/batches', medicamentoController.getBatchesWithFilters);

/**
 * @swagger
 * /api/v1/admin/inventory/stock:
 *   get:
 *     summary: Vista consolidada de stock
 *     tags: [Admin - Almacenes e Inventario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock consolidado
 */
router.get('/inventory/stock', medicamentoController.getConsolidatedStock);

/**
 * @swagger
 * /api/v1/admin/stats/expiring:
 *   get:
 *     summary: Lotes próximos a vencer
 *     tags: [Admin - Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: Lista de lotes próximos a vencer
 */
router.get('/stats/expiring', medicamentoController.getExpiringBatches);

export default router;
