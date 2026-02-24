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
 *               centromedico:
 *                 type: string
 *               relacion_solicitante:
 *                 type: string
 *               patologia:
 *                 type: string
 *               documentos:
 *                 type: object
 *                 description: URLs de documentos del paciente en Supabase Storage
 *                 example:
 *                   cedula: "https://proyecto.supabase.co/storage/v1/object/public/documentos/cedula.pdf"
 *                   receta: "https://proyecto.supabase.co/storage/v1/object/public/documentos/receta.pdf"
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
 *               idalmacen_retiro:
 *                 type: integer
 *                 description: Obligatorio al aprobar. ID del almacén donde el cliente retirará (también acepta solicitud_de_retiro).
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       400:
 *         description: Transición de estado inválida
 */
router.patch('/solicitudes/:id/estado', solicitudController.updateSolicitudEstado);

// ==========================================================
// DETALLE DE SOLICITUD (asignación de medicamentos reales por el admin)
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/solicitudes/{id}/detalles:
 *   get:
 *     summary: Obtener detalles asignados a una solicitud
 *     description: Devuelve los medicamentos reales (lotes, almacenes, cantidades) asignados a la solicitud
 *     tags: [Admin - Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de solicitud
 *     responses:
 *       200:
 *         description: Lista de detalles con info de lote, medicamento y almacén
 *       404:
 *         description: Solicitud no encontrada
 *   patch:
 *     summary: Asignar medicamentos reales a una solicitud
 *     description: |
 *       Permite al admin asignar medicamentos reales (de lotes/almacenes específicos) a una solicitud EN_REVISION.
 *       Valida que los lotes y almacenes existan y que haya stock suficiente.
 *       Reemplaza los detalles previos si los hubiera.
 *     tags: [Admin - Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de solicitud
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - detalles
 *             properties:
 *               detalles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - idalmacen
 *                     - codigolote
 *                     - cantidad
 *                     - dosis_indicada
 *                     - tiempo_tratamiento
 *                   properties:
 *                     idalmacen:
 *                       type: integer
 *                       description: ID del almacén
 *                     codigolote:
 *                       type: string
 *                       description: Código del lote
 *                     cantidad:
 *                       type: integer
 *                       description: Cantidad a asignar
 *                     dosis_indicada:
 *                       type: string
 *                       description: Dosis indicada por el médico
 *                     tiempo_tratamiento:
 *                       type: string
 *                       description: Duración del tratamiento
 *     responses:
 *       200:
 *         description: Medicamentos asignados exitosamente
 *       400:
 *         description: Solicitud no está EN_REVISION, stock insuficiente, lote/almacén no encontrado
 *       404:
 *         description: Solicitud no encontrada
 *   delete:
 *     summary: Eliminar todos los detalles de una solicitud
 *     description: Elimina todos los medicamentos asignados. No se permite en solicitudes DESPACHADA.
 *     tags: [Admin - Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Número de solicitud
 *     responses:
 *       200:
 *         description: Detalles eliminados exitosamente
 *       400:
 *         description: No se pueden eliminar detalles de solicitud despachada
 *       404:
 *         description: Solicitud no encontrada
 */
router.get('/solicitudes/:id/detalles', solicitudController.getDetallesSolicitud);
router.patch('/solicitudes/:id/detalles', solicitudController.asignarDetalles);
router.delete('/solicitudes/:id/detalles', solicitudController.eliminarDetalles);

export default router;
