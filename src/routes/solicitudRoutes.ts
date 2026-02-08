import { Router } from 'express';
import solicitudController from '../controllers/solicitudController.js';

const router = Router();

// ==========================================================
// SOLICITUDES
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/solicitudes:
 *   get:
 *     summary: Listar solicitudes (excluye PENDIENTE por defecto)
 *     description: Solo muestra solicitudes enviadas (EN_REVISION o posterior). Las solicitudes en PENDIENTE son borradores del usuario.
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
 *           enum: [EN_REVISION, APROBADA, RECHAZADA, DESPACHADA, CANCELADA, INCOMPLETA]
 *     responses:
 *       200:
 *         description: Lista de solicitudes
 *   post:
 *     summary: Crear una nueva solicitud
 *     tags: [Admin - Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idusuario:
 *                 type: integer
 *               cedularepresentante:
 *                 type: string
 *                 description: Debe tener 11 dígitos
 *               codigotiposolicitud:
 *                 type: string
 *               numeroafiliado:
 *                 type: string
 *               idcentro:
 *                 type: integer
 *               relacion_solicitante:
 *                 type: string
 *               patologia:
 *                 type: string
 *               observaciones:
 *                 type: string
 *               medicamentos_solicitados:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     nombre:
 *                       type: string
 *                     dosis:
 *                       type: string
 *     responses:
 *       201:
 *         description: Solicitud creada
 */
router.get('/solicitudes', solicitudController.getSolicitudes);
router.post('/solicitudes', solicitudController.createSolicitud);

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
 * /api/v1/admin/solicitudes/{id}/estado:
 *   patch:
 *     summary: Cambiar estado de solicitud
 *     description: |
 *       Transiciones válidas:
 *       - PENDIENTE → EN_REVISION, CANCELADA
 *       - EN_REVISION → APROBADA, RECHAZADA, INCOMPLETA, CANCELADA
 *       - INCOMPLETA → EN_REVISION, CANCELADA
 *       - APROBADA → DESPACHADA, CANCELADA
 *       - RECHAZADA → EN_REVISION
 *       - DESPACHADA → (estado final)
 *       - CANCELADA → (estado final)
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
 *                 enum: [PENDIENTE, EN_REVISION, APROBADA, RECHAZADA, DESPACHADA, CANCELADA, INCOMPLETA]
 *               observaciones:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         description: Transición de estado inválida
 */
router.patch('/solicitudes/:id/estado', solicitudController.updateSolicitudEstado);

export default router;
