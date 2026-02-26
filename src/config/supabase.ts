import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Variables de entorno requeridas
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// URL base para construir URLs públicas de archivos
export const SUPABASE_STORAGE_URL = process.env.SUPABASE_STORAGE_URL || '';

// Nombre del bucket único
export const BUCKET_NAME = 'DONAMED BUCKET';

// Carpetas dentro del bucket
export const STORAGE_FOLDERS = {
  FOTOS_PERFIL: 'FOTOS_PERFIL',
  DOCUMENTOS_PACIENTES: 'DOCUMENTOS_PACIENTES',
  MEDICAMENTOS: 'MEDICAMENTOS'
} as const;

export type StorageFolder = typeof STORAGE_FOLDERS[keyof typeof STORAGE_FOLDERS];

// Validar configuración
if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.warn('⚠️ SUPABASE_URL o SUPABASE_SERVICE_KEY no configuradas. Storage no disponible.');
}

// Singleton pattern para el cliente de Supabase
declare global {
  // eslint-disable-next-line no-var
  var supabase: SupabaseClient | undefined;
}

const supabase: SupabaseClient | null = SUPABASE_URL && SUPABASE_SERVICE_KEY
  ? globalThis.supabase || createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

if (supabase && process.env.NODE_ENV !== 'production') {
  globalThis.supabase = supabase;
}

export default supabase;
