import { Router } from 'express';
import medicamentoController from '../controllers/medicamentoController.js';
import { medicamentoPhotoUpload } from '../middlewares/uploadMiddleware.js';

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
 *               foto_url:
 *                 type: string
 *                 example: "MEDICAMENTOS/med_abc123.jpg"
 *                 description: Ruta relativa de la imagen en Supabase Storage
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               compuesto_principal:
 *                 type: string
 *               idvia_administracion:
 *                 type: integer
 *               idforma_farmaceutica:
 *                 type: integer
 *               estado:
 *                 type: string
 *                 enum: [ACTIVO, INACTIVO]
 *               categorias:
 *                 type: array
 *                 items:
 *                   type: integer
 *               enfermedades:
 *                 type: array
 *                 items:
 *                   type: integer
 *               foto_url:
 *                 type: string
 *                 example: "MEDICAMENTOS/med_abc123.jpg"
 *                 description: Ruta relativa de la imagen en Supabase Storage
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

// ==========================================================
// FOTO DE MEDICAMENTO
// ==========================================================

/**
 * @swagger
 * /api/v1/admin/medicamentos/{codigo}/foto:
 *   post:
 *     summary: Subir o reemplazar foto de medicamento
 *     description: Sube una imagen al bucket de Supabase Storage en la carpeta MEDICAMENTOS. Si el medicamento ya tiene foto, la reemplaza.
 *     tags: [Admin - Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *         description: Código del medicamento
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - foto
 *             properties:
 *               foto:
 *                 type: string
 *                 format: binary
 *                 description: "Imagen del medicamento (JPEG, PNG, GIF, WebP). Máximo 5MB."
 *     responses:
 *       200:
 *         description: Foto subida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     foto_url:
 *                       type: string
 *                       example: "MEDICAMENTOS/med_MED001_1709912345678.jpg"
 *                     foto_url_publica:
 *                       type: string
 *                       example: "https://xxx.supabase.co/storage/v1/object/public/DONAMED%20BUCKET/MEDICAMENTOS/med_MED001_1709912345678.jpg"
 *                 message:
 *                   type: string
 *       400:
 *         description: No se proporcionó imagen o tipo de archivo no válido
 *       404:
 *         description: Medicamento no encontrado
 *   delete:
 *     summary: Eliminar foto de medicamento
 *     description: Elimina la imagen del medicamento de Supabase Storage y limpia el campo foto_url.
 *     tags: [Admin - Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: codigo
 *         required: true
 *         schema:
 *           type: string
 *         description: Código del medicamento
 *     responses:
 *       200:
 *         description: Foto eliminada exitosamente
 *       400:
 *         description: El medicamento no tiene foto asignada
 *       404:
 *         description: Medicamento no encontrado
 */
router.post('/medicamentos/:codigo/foto', medicamentoPhotoUpload, medicamentoController.uploadPhoto);
router.delete('/medicamentos/:codigo/foto', medicamentoController.deletePhoto);

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

export default router;
