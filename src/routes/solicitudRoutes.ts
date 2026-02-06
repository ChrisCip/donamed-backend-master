import { Router, Request, Response, NextFunction } from 'express';
import solicitudController from '../controllers/solicitudController.js';

const router = Router();

// ==========================================================
// SOLICITUDES
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/solicitudes:
 *   get:
 *     summary: Listar solicitudes
 *     tags: [Admin - Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, APROBADA, RECHAZADA, DESPACHADA]
 *     responses:
 *       200:
 *         description: Lista de solicitudes
 */
router.get('/solicitudes', solicitudController.getSolicitudes);

/**
 * @swagger
 * /api/v1/admin/solicitudes/{id}:
 *   get:
 *     summary: Obtener detalle de solicitud
 *     tags: [Admin - Solicitudes]
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
 *         description: Detalle de solicitud
 */
router.get('/solicitudes/:id', solicitudController.getSolicitudById);

/**
 * @swagger
 * /api/v1/admin/solicitudes/{id}/evaluate:
 *   patch:
 *     summary: Evaluar solicitud (Aprobar/Rechazar)
 *     tags: [Admin - Solicitudes]
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
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [APROBADA, RECHAZADA]
 *     responses:
 *       200:
 *         description: Solicitud evaluada
 */
router.patch('/solicitudes/:id/evaluate', solicitudController.evaluateSolicitud);

/**
 * @swagger
 * /api/v1/admin/solicitudes/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de solicitud
 *     tags: [Admin - Solicitudes]
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
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [PENDIENTE, APROBADA, RECHAZADA, DESPACHADA]
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch('/solicitudes/:id/estado', solicitudController.updateSolicitudEstado);

/**
 * @swagger
 * /api/v1/admin/solicitudes/{id}/dispatch:
 *   post:
 *     summary: Generar despacho para una solicitud aprobada
 *     tags: [Admin - Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cedula_recibido_por:
 *                 type: string
 *     responses:
 *       201:
 *         description: Despacho creado
 */
router.post('/solicitudes/:id/dispatch', (req: Request, res: Response, next: NextFunction) => {
  req.body.solicitud = parseInt(req.params.id);
  req.body.cedula_recibe = req.body.cedula_recibido_por;
  solicitudController.createDespacho(req, res, next);
});

// Aliases en inglés
router.get('/requests', solicitudController.getSolicitudes);
router.get('/requests/:id', solicitudController.getSolicitudById);
router.patch('/requests/:id/evaluate', solicitudController.evaluateSolicitud);
router.post('/requests/:id/dispatch', (req: Request, res: Response, next: NextFunction) => {
  req.body.solicitud = parseInt(req.params.id);
  req.body.cedula_recibe = req.body.cedula_recibido_por;
  solicitudController.createDespacho(req, res, next);
});

// ==========================================================
// DESPACHOS
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/despachos:
 *   get:
 *     summary: Listar despachos
 *     tags: [Admin - Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de despachos
 *   post:
 *     summary: Crear despacho
 *     tags: [Admin - Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - solicitud
 *             properties:
 *               solicitud:
 *                 type: integer
 *               cedula_recibe:
 *                 type: string
 *     responses:
 *       201:
 *         description: Despacho creado
 */
router.get('/despachos', solicitudController.getDespachos);
router.post('/despachos', solicitudController.createDespacho);

/**
 * @swagger
 * /api/v1/admin/stats/pathologies:
 *   get:
 *     summary: Top enfermedades/patologías solicitadas
 *     tags: [Admin - Estadísticas]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top patologías solicitadas
 */
router.get('/stats/pathologies', solicitudController.getPathologiesStats);

export default router;
