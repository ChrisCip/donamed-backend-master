import multer from 'multer';
import type { Request } from 'express';
import type { FileFilterCallback } from 'multer';

/**
 * Tipos MIME permitidos para fotos de medicamentos
 */
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
];

/**
 * Tamaño máximo del archivo: 5MB
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Filtro de archivos: solo imágenes permitidas
 */
const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Solo se permiten: JPEG, PNG, GIF, WebP`));
    }
};

/**
 * Configuración de multer para fotos de medicamentos
 * Usa memoryStorage para mantener el archivo en buffer (sin guardar en disco)
 */
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_FILE_SIZE,
    },
    fileFilter: imageFileFilter,
});

/**
 * Middleware para subir una sola foto de medicamento
 * El campo del formulario debe llamarse "foto"
 */
export const medicamentoPhotoUpload = upload.single('foto');
