import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let swaggerSpec: Record<string, unknown>;

try {
  // Cargar el spec pre-generado por generateSwagger.ts
  const specPath = join(__dirname, '../swagger-spec.json');
  swaggerSpec = JSON.parse(readFileSync(specPath, 'utf-8'));
} catch {
  console.warn('⚠️ swagger-spec.json no encontrado. Ejecute: npm run swagger:generate');
  swaggerSpec = {
    openapi: '3.0.0',
    info: { title: 'DONAMED API', version: '1.0.0' },
    paths: {},
  };
}

export default swaggerSpec;
