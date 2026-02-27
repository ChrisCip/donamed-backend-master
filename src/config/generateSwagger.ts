import swaggerJsdoc from 'swagger-jsdoc';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'DONAMED API',
            version: '1.0.0',
            description: 'API para el sistema de gestión de donaciones de medicamentos de alto costo en República Dominicana',
            contact: {
                name: 'Equipo DONAMED',
                email: 'contacto@donamed.do'
            }
        },
        servers: [
            {
                url: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000',
                description: process.env.VERCEL_URL ? 'Servidor Vercel' : 'Servidor de Desarrollo'
            },
            {
                url: 'https://api.donamed.do',
                description: 'Servidor de Producción'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Ingrese el token JWT obtenido al iniciar sesión'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: {
                            type: 'object',
                            properties: {
                                message: { type: 'string', example: 'Mensaje de error' }
                            }
                        }
                    }
                },
                Perfil: {
                    type: 'object',
                    properties: {
                        IDUsuario: { type: 'integer', example: 1 },
                        correo: { type: 'string', format: 'email', example: 'mariacon@ejemplo.com' },
                        cedula_usuario: { type: 'string', example: '00112345678' },
                        codigo_rol: { type: 'string', example: 'PACIENTE' },
                        persona: {
                            type: 'object',
                            properties: {
                                Cedula: { type: 'string', example: '00112345678' },
                                nombre: { type: 'string', example: 'María' },
                                apellidos: { type: 'string', example: 'Concepción' },
                                sexo: { type: 'string', enum: ['M', 'F'], example: 'F' },
                                fecha_nacimiento: { type: 'string', format: 'date', example: '1990-01-15' },
                                telefono: { type: 'string', example: '809-693-8956' },
                                direccion: { type: 'string', example: 'Calle Principal #123' }
                            }
                        },
                        rol: {
                            type: 'object',
                            properties: {
                                CodigoRol: { type: 'string', example: 'PACIENTE' },
                                nombre: { type: 'string', example: 'Paciente' }
                            }
                        }
                    }
                },
                ActualizarPerfil: {
                    type: 'object',
                    properties: {
                        nombre: { type: 'string', example: 'María' },
                        apellidos: { type: 'string', example: 'Concepción' },
                        telefono: { type: 'string', example: '809-555-1234' },
                        correo: { type: 'string', format: 'email', example: 'marianueva@ejemplo.com' },
                        direccion: { type: 'string', example: 'Nueva dirección' },
                        CodigoCiudad: { type: 'integer', example: 2 }
                    }
                },
                Solicitud: {
                    type: 'object',
                    properties: {
                        NumeroSolicitud: { type: 'integer', example: 1 },
                        estado: {
                            type: 'string',
                            enum: ['PENDIENTE', 'EN_REVISION', 'APROBADA', 'RECHAZADA', 'DESPACHADA', 'CANCELADA', 'INCOMPLETA'],
                            example: 'PENDIENTE'
                        },
                        creada_en: { type: 'string', format: 'date-time', example: '2024-03-12T10:30:00Z' },
                        patologia: { type: 'string', example: 'Diabetes Tipo 1' }
                    }
                },
                Medicamento: {
                    type: 'object',
                    properties: {
                        codigomedicamento: { type: 'string', example: 'MED-001' },
                        nombre: { type: 'string', example: 'Ibuprofeno 400mg' },
                        descripcion: { type: 'string', nullable: true },
                        compuesto_principal: { type: 'string', example: 'Ibuprofeno' },
                        estado: { type: 'string', enum: ['ACTIVO', 'INACTIVO'], example: 'ACTIVO' },
                        foto_url: { type: 'string', nullable: true, example: 'MEDICAMENTOS/med_MED001_1709912345678.jpg' }
                    }
                }
            }
        },
        security: [
            {
                bearerAuth: []
            }
        ]
    },
    apis: [
        join(__dirname, '../routes/adminRoutes.ts'),
        join(__dirname, '../routes/almacenRoutes.ts'),
        join(__dirname, '../routes/authRoutes.ts'),
        join(__dirname, '../routes/catalogoRoutes.ts'),
        join(__dirname, '../routes/categoriaRoutes.ts'),
        join(__dirname, '../routes/dashboardRoutes.ts'),
        join(__dirname, '../routes/despachoRoutes.ts'),
        join(__dirname, '../routes/donacionRoutes.ts'),
        join(__dirname, '../routes/enfermedadRoutes.ts'),
        join(__dirname, '../routes/formaFarmaceuticaRoutes.ts'),
        join(__dirname, '../routes/loteRoutes.ts'),
        join(__dirname, '../routes/medicamentoRoutes.ts'),
        join(__dirname, '../routes/medicamentoSolicitadoRoutes.ts'),
        join(__dirname, '../routes/personaRoutes.ts'),
        join(__dirname, '../routes/proveedorRoutes.ts'),
        join(__dirname, '../routes/solicitudRoutes.ts'),
        join(__dirname, '../routes/ubicacionRoutes.ts'),
        join(__dirname, '../routes/userRoutes.ts'),
        join(__dirname, '../routes/viaAdministracionRoutes.ts'),
    ]
};

const swaggerSpec = swaggerJsdoc(options) as { paths?: Record<string, unknown> };

// Escribir el spec a un archivo JSON
const outputPath = join(__dirname, '../swagger-spec.json');
writeFileSync(outputPath, JSON.stringify(swaggerSpec, null, 2));

console.log(`✅ Swagger spec generado en: ${outputPath}`);
console.log(`   Paths encontrados: ${Object.keys(swaggerSpec.paths || {}).length}`);
