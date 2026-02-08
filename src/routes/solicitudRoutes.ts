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
 *           enum: [PENDIENTE, EN_REVISION, APROBADA, RECHAZADA, DESPACHADA, CANCELADA, INCOMPLETA]
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
 *   put:
 *     summary: Actualizar solicitud
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
 *               cedularepresentante:
 *                 type: string
 *               codigotiposolicitud:
 *                 type: string
 *               patologia:
 *                 type: string
 *               observaciones:
 *                 type: string
 *               documentos:
 *                 type: object
 *     responses:
 *       200:
 *         description: Solicitud actualizada
 */
router.get('/solicitudes/:id', solicitudController.getSolicitudById);
router.put('/solicitudes/:id', solicitudController.updateSolicitud);

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
 *                 enum: [APROBADA, RECHAZADA, INCOMPLETA]
 *               observaciones:
 *                 type: string
 *                 description: Observaciones al cambiar el estado
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
 *                 enum: [PENDIENTE, EN_REVISION, APROBADA, RECHAZADA, DESPACHADA, CANCELADA, INCOMPLETA]
 *               observaciones:
 *                 type: string
 *     responses:
 *       200:
 *         description: Estado actualizado
 */
router.patch('/solicitudes/:id/estado', solicitudController.updateSolicitudEstado);

/**
 * @swagger
 * /api/v1/admin/solicitudes/{id}/confirmar:
 *   patch:
 *     summary: Confirmar solicitud (PENDIENTE -> EN_REVISION)
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
 *         description: Solicitud confirmada y enviada a revisión
 */
router.patch('/solicitudes/:id/confirmar', solicitudController.confirmarSolicitud);

/**
 * @swagger
 * /api/v1/admin/solicitudes/{id}/detalle:
 *   post:
 *     summary: Agregar medicamento real a solicitud (Admin asigna lote del inventario)
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
 *               - idalmacen
 *               - codigolote
 *               - cantidad
 *             properties:
 *               idalmacen:
 *                 type: integer
 *               codigolote:
 *                 type: string
 *               cantidad:
 *                 type: integer
 *               dosis_indicada:
 *                 type: string
 *               tiempo_tratamiento:
 *                 type: string
 *     responses:
 *       201:
 *         description: Medicamento asignado
 *   delete:
 *     summary: Remover medicamento de solicitud
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
 *               - idalmacen
 *               - codigolote
 *             properties:
 *               idalmacen:
 *                 type: integer
 *               codigolote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Medicamento removido
 */
router.post('/solicitudes/:id/detalle', solicitudController.addDetalleSolicitud);
router.delete('/solicitudes/:id/detalle', solicitudController.removeDetalleSolicitud);

/**
 * @swagger
 * /api/v1/admin/solicitudes/{id}/medicamentos-solicitados:
 *   get:
 *     summary: Obtener medicamentos solicitados de una solicitud
 *     description: Lista los medicamentos que el paciente solicitó (texto libre)
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
 *         description: Lista de medicamentos solicitados
 */
router.get('/solicitudes/:id/medicamentos-solicitados', solicitudController.getMedicamentosSolicitados);

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
