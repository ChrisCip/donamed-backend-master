import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import errorHandler from './middlewares/errorHandler.js';
import prisma from './config/prisma.js';
import type { ApiResponse } from './types/index.js';

const app: Express = express();

// ==========================================================
// MIDDLEWARES GLOBALES
// ==========================================================

// CORS - Configuración para permitir peticiones desde el frontend
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Body parser - Para parsear JSON y datos de formularios
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de peticiones en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ==========================================================
// DOCUMENTACIÓN SWAGGER
// ==========================================================

// Configuración personalizada de Swagger UI
const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'DONAMED API Docs',
  customfavIcon: '/favicon.ico'
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// Endpoint para obtener el spec en formato JSON
app.get('/api-docs.json', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// ==========================================================
// HEALTH CHECK
// ==========================================================

app.get('/health', (_req: Request, res: Response<ApiResponse>) => {
  res.status(200).json({
    success: true,
    message: 'API DONAMED funcionando correctamente',
    data: {
      timestamp: new Date().toISOString()
    }
  });
});

// DEBUG: Ver usuarios en la base de datos
app.get('/debug/users', async (_req: Request, res: Response) => {
  try {
    const users = await prisma.usuario.findMany({
      select: {
        idusuario: true,
        correo: true,
        codigo_rol: true,
        estado: true,
      }
    });
    res.json({ success: true, count: users.length, users });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================================
// RUTAS API v1
// ==========================================================

app.use('/api/v1', userRoutes);
app.use('/api/v1/admin', adminRoutes);

// ==========================================================
// MANEJO DE RUTAS NO ENCONTRADAS
// ==========================================================

app.use('*', (req: Request, res: Response<ApiResponse>) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Ruta ${req.originalUrl} no encontrada`
    }
  });
});

// ==========================================================
// MIDDLEWARE DE MANEJO DE ERRORES (debe ir al final)
// ==========================================================

app.use(errorHandler);

export default app;
