import { Router } from 'express';
import medicamentoSolicitadoController from '../controllers/medicamentoSolicitadoController.js';

const router = Router();

// ==========================================================
// MEDICAMENTOS SOLICITADOS
// Tabla separada para medicamentos solicitados por pacientes (texto libre)
// Solo visible mediante filtros por diseño
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/medicamentos-solicitados:
 *   get:
 *     summary: Listar medicamentos solicitados (requiere filtro)
 *     description: |
 *       Obtiene la lista de medicamentos solicitados por pacientes.
 *       REQUIERE al menos un filtro (numerosolicitud o nombre).
 *       No devuelve nombre de paciente, fecha ni hora por diseño.
 *     tags: [Admin - Medicamentos Solicitados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: numerosolicitud
 *         schema:
 *           type: integer
 *         description: Filtrar por número de solicitud
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Buscar por nombre del medicamento
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
 *     responses:
 *       200:
 *         description: Lista de medicamentos solicitados
 *       400:
 *         description: Debe especificar un filtro
 *   post:
 *     summary: Agregar medicamento solicitado a una solicitud
 *     description: |
 *       Agrega un medicamento (texto libre) a una solicitud.
 *       Solo funciona si la solicitud está en estado PENDIENTE, EN_REVISION o INCOMPLETA.
 *     tags: [Admin - Medicamentos Solicitados]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numerosolicitud
 *               - nombre
 *             properties:
 *               numerosolicitud:
 *                 type: integer
 *                 description: Número de la solicitud
 *               nombre:
 *                 type: string
 *                 description: Nombre del medicamento (texto libre)
 *                 example: "Adalimumab 40mg"
 *               dosis:
 *                 type: string
 *                 description: Dosis indicada
 *                 example: "1 vez por semana"
 *     responses:
 *       201:
 *         description: Medicamento agregado exitosamente
 *       400:
 *         description: Estado de solicitud no permite agregar medicamentos
 *       404:
 *         description: Solicitud no encontrada
 */
router.get('/', medicamentoSolicitadoController.getMedicamentosSolicitados);
router.post('/', medicamentoSolicitadoController.createMedicamentoSolicitado);

/**
 * @swagger
 * /api/v1/admin/medicamentos-solicitados/bulk:
 *   post:
 *     summary: Agregar múltiples medicamentos solicitados
 *     description: Agrega varios medicamentos a una solicitud en una sola operación
 *     tags: [Admin - Medicamentos Solicitados]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numerosolicitud
 *               - medicamentos
 *             properties:
 *               numerosolicitud:
 *                 type: integer
 *               medicamentos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - nombre
 *                   properties:
 *                     nombre:
 *                       type: string
 *                       example: "Trastuzumab 440mg"
 *                     dosis:
 *                       type: string
 *                       example: "cada 3 semanas"
 *     responses:
 *       201:
 *         description: Medicamentos agregados
 */
router.post('/bulk', medicamentoSolicitadoController.createManyMedicamentosSolicitados);

/**
 * @swagger
 * /api/v1/admin/medicamentos-solicitados/{id}:
 *   get:
 *     summary: Obtener detalle de un medicamento solicitado
 *     tags: [Admin - Medicamentos Solicitados]
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
 *         description: Detalle del medicamento solicitado
 *       404:
 *         description: No encontrado
 *   put:
 *     summary: Actualizar medicamento solicitado
 *     tags: [Admin - Medicamentos Solicitados]
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
 *               nombre:
 *                 type: string
 *               dosis:
 *                 type: string
 *     responses:
 *       200:
 *         description: Medicamento actualizado
 *       400:
 *         description: Estado de solicitud no permite modificaciones
 *       404:
 *         description: No encontrado
 *   delete:
 *     summary: Eliminar medicamento solicitado
 *     tags: [Admin - Medicamentos Solicitados]
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
 *         description: Medicamento eliminado
 *       400:
 *         description: Estado de solicitud no permite eliminaciones
 *       404:
 *         description: No encontrado
 */
router.get('/:id', medicamentoSolicitadoController.getMedicamentoSolicitadoById);
router.put('/:id', medicamentoSolicitadoController.updateMedicamentoSolicitado);
router.delete('/:id', medicamentoSolicitadoController.deleteMedicamentoSolicitado);

/**
 * @swagger
 * /api/v1/admin/solicitudes/{numerosolicitud}/medicamentos-solicitados:
 *   get:
 *     summary: Obtener medicamentos solicitados de una solicitud
 *     tags: [Admin - Solicitudes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: numerosolicitud
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de medicamentos solicitados
 *       404:
 *         description: Solicitud no encontrada
 */
// Esta ruta se registra en solicitudRoutes para mantener consistencia

export default router;
