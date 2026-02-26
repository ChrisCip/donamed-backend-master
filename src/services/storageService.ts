import supabase, { BUCKET_NAME, STORAGE_FOLDERS, SUPABASE_STORAGE_URL } from '../config/supabase.js';
import type { AppError } from '../types/index.js';

/**
 * Tipos MIME permitidos para imágenes
 */
const ALLOWED_MIME_TYPES = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
];

/**
 * Tamaño máximo de imagen: 5MB
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Servicio para gestión de archivos en Supabase Storage
 */
class StorageService {
    /**
     * Verifica que el cliente de Supabase esté disponible
     */
    private ensureClient() {
        if (!supabase) {
            const error: AppError = new Error(
                'Supabase Storage no está configurado. Verifica las variables de entorno SUPABASE_URL y SUPABASE_SERVICE_KEY.'
            );
            error.statusCode = 503;
            throw error;
        }
        return supabase;
    }

    /**
     * Sube la foto de un medicamento a Supabase Storage
     * @param file - Buffer del archivo con su metadata
     * @param codigoMedicamento - Código del medicamento para nombrar el archivo
     * @returns Ruta relativa del archivo subido (ej: "MEDICAMENTOS/med_abc123.jpg")
     */
    async uploadMedicamentoPhoto(
        file: { buffer: Buffer; mimetype: string; originalname: string; size: number },
        codigoMedicamento: string
    ): Promise<string> {
        const client = this.ensureClient();

        // Validar tipo MIME
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
            const error: AppError = new Error(
                `Tipo de archivo no permitido: ${file.mimetype}. Tipos permitidos: JPEG, PNG, GIF, WebP`
            );
            error.statusCode = 400;
            throw error;
        }

        // Validar tamaño
        if (file.size > MAX_FILE_SIZE) {
            const error: AppError = new Error(
                `El archivo excede el tamaño máximo permitido de 5MB. Tamaño recibido: ${(file.size / 1024 / 1024).toFixed(2)}MB`
            );
            error.statusCode = 400;
            throw error;
        }

        // Generar nombre único para el archivo
        const extension = this.getExtensionFromMime(file.mimetype);
        const timestamp = Date.now();
        const sanitizedCode = codigoMedicamento.replace(/[^a-zA-Z0-9_-]/g, '_');
        const fileName = `med_${sanitizedCode}_${timestamp}${extension}`;
        const filePath = `${STORAGE_FOLDERS.MEDICAMENTOS}/${fileName}`;

        // Subir a Supabase Storage
        const { error } = await client.storage
            .from(BUCKET_NAME)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false,
            });

        if (error) {
            const appError: AppError = new Error(`Error al subir imagen: ${error.message}`);
            appError.statusCode = 500;
            throw appError;
        }

        return filePath;
    }

    /**
     * Elimina la foto de un medicamento de Supabase Storage
     * @param fotoUrl - Ruta relativa del archivo (ej: "MEDICAMENTOS/med_abc123.jpg")
     */
    async deleteMedicamentoPhoto(fotoUrl: string): Promise<void> {
        const client = this.ensureClient();

        const { error } = await client.storage
            .from(BUCKET_NAME)
            .remove([fotoUrl]);

        if (error) {
            const appError: AppError = new Error(`Error al eliminar imagen: ${error.message}`);
            appError.statusCode = 500;
            throw appError;
        }
    }

    /**
     * Construye la URL pública a partir de una ruta relativa
     * @param relativePath - Ruta relativa (ej: "MEDICAMENTOS/med_abc123.jpg")
     * @returns URL pública completa
     */
    getPublicUrl(relativePath: string): string {
        if (!relativePath) return '';
        return `${SUPABASE_STORAGE_URL}/${relativePath}`;
    }

    /**
     * Obtiene la extensión de archivo a partir del tipo MIME
     */
    private getExtensionFromMime(mimetype: string): string {
        const map: Record<string, string> = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'image/webp': '.webp',
        };
        return map[mimetype] || '.jpg';
    }
}

export default new StorageService();
