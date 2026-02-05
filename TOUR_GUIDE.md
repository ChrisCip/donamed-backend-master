# 🎯 Guía de Tour por el Código - DONAMED Backend

## 📂 Estructura General del Proyecto

```
donamed-backend/
├── prisma/
│   └── schema.prisma              # Modelos de base de datos
├── src/
│   ├── config/
│   │   ├── prisma.js              # Configuración de Prisma Client
│   │   └── swagger.js             # Configuración de Swagger
│   ├── controllers/
│   │   └── userController.js      # Controladores de usuario
│   ├── services/
│   │   └── userService.js         # Lógica de negocio
│   ├── routes/
│   │   └── userRoutes.js          # Definición de rutas
│   ├── middlewares/
│   │   ├── authMiddleware.js      # Autenticación JWT
│   │   └── errorHandler.js        # Manejo de errores
│   ├── utils/
│   │   └── jwt.js                 # Utilidades JWT
│   ├── app.js                     # Configuración de Express
│   └── server.js                  # Punto de entrada
├── .env                           # Variables de entorno
├── package.json                   # Dependencias
├── FIGMA_ANALYSIS.md             # Análisis de diseño
└── README.md                      # Documentación
```

---

## 🔍 Tour Detallado por Cada Archivo

### 1️⃣ **prisma/schema.prisma**

**Propósito:** Define todos los modelos de la base de datos y sus relaciones.

**Puntos clave:**
```prisma
// Enums para tipos de datos fijos
enum tipo_sexo { M, F }
enum tipo_estado_solicitud { PENDIENTE, APROBADA, RECHAZADA, DESPACHADA }

// Modelo Usuario (autenticación)
model Usuario {
  IDUsuario       Int      @id @default(autoincrement())
  correo          String   @unique
  contraseña      String
  cedula_usuario  String?  @unique
  codigo_rol      String?
  
  // Relaciones
  persona         Persona? @relation(fields: [cedula_usuario], references: [Cedula])
  rol             Rol?     @relation(fields: [codigo_rol], references: [CodigoRol])
  solicitudes     Solicitud[]
}

// Modelo Persona (datos demográficos)
model Persona {
  Cedula            String   @id
  nombre            String
  apellidos         String
  telefono          String?
  // ... más campos
}
```

**Conceptos importantes:**
- **Relación Usuario → Persona:** Un usuario puede tener una persona asociada (por la cédula)
- **Relación Usuario → Rol:** Cada usuario tiene un rol (PACIENTE, ADMIN, etc.)
- **Relación Usuario → Solicitudes:** Un usuario puede tener muchas solicitudes

---

### 2️⃣ **src/config/prisma.js**

**Propósito:** Singleton de PrismaClient para evitar múltiples conexiones.

```javascript
import { PrismaClient } from '@prisma/client';

// Patrón Singleton
const globalForPrisma = globalThis;

const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

// En desarrollo, guarda en global para evitar reconexiones
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
```

**Por qué es importante:**
- Evita crear múltiples instancias de PrismaClient
- En desarrollo, reutiliza la conexión entre hot-reloads
- Configura logging según el entorno

---

### 3️⃣ **src/config/swagger.js**

**Propósito:** Configuración de la documentación Swagger/OpenAPI.

**Estructura:**
```javascript
{
  definition: {
    openapi: '3.0.0',
    info: { ... },
    servers: [ ... ],
    components: {
      securitySchemes: {
        bearerAuth: { ... }  // Autenticación JWT
      },
      schemas: {
        Perfil: { ... },     // Esquemas de datos
        Solicitud: { ... }
      }
    }
  },
  apis: ['./src/routes/*.js']  // Archivos con anotaciones @swagger
}
```

**Qué hace:**
- Define la estructura de la documentación
- Describe los esquemas de datos (Perfil, Solicitud, etc.)
- Configura la autenticación Bearer (JWT)
- Lee las anotaciones `@swagger` de los archivos de rutas

---

### 4️⃣ **src/services/userService.js**

**Propósito:** Contiene toda la lógica de negocio relacionada con usuarios.

**Métodos principales:**

#### `getUserProfile(userId)`
```javascript
async getUserProfile(userId) {
  const user = await prisma.usuario.findUnique({
    where: { IDUsuario: userId },
    select: {
      // Lista explícita de campos (excluye contraseña)
      IDUsuario: true,
      correo: true,
      contraseña: false,  // 🔒 SEGURIDAD: Excluir contraseña
      
      // Incluir relaciones
      persona: {
        select: { ... },
        // Ciudad anidada dentro de persona
        ciudad: {
          select: { ... },
          // Provincia anidada dentro de ciudad
          provincia: { ... }
        }
      },
      rol: { ... }
    }
  });
  
  if (!user) throw error;
  return user;
}
```

**Conceptos clave:**
- **`select`**: Permite elegir exactamente qué campos devolver
- **`include`**: Incluye relaciones completas
- **Relaciones anidadas**: `persona.ciudad.provincia`
- **Seguridad**: `contraseña: false` garantiza que nunca se envíe

#### `updatePersonalInfo(cedula, data)`
```javascript
async updatePersonalInfo(cedula, data) {
  // Filtrar solo campos permitidos
  const allowedFields = {
    nombre: data.nombre,
    apellidos: data.apellidos,
    telefono: data.telefono,
    direccion: data.direccion,
    CodigoCiudad: data.CodigoCiudad
  };
  
  // Remover campos undefined
  const updateData = Object.fromEntries(
    Object.entries(allowedFields).filter(([_, v]) => v !== undefined)
  );
  
  return await prisma.persona.update({
    where: { Cedula: cedula },
    data: updateData
  });
}
```

**Por qué este patrón:**
- Solo actualiza campos que realmente vienen en `data`
- Protege contra inyección de campos no permitidos
- Actualiza la tabla `Persona` (no `Usuario`)

#### `updateEmail(userId, nuevoCorreo)`
```javascript
async updateEmail(userId, nuevoCorreo) {
  // 1. Verificar si el correo ya existe
  const existingUser = await prisma.usuario.findUnique({
    where: { correo: nuevoCorreo }
  });
  
  // 2. Si existe Y no es el mismo usuario, error
  if (existingUser && existingUser.IDUsuario !== userId) {
    throw error 409;
  }
  
  // 3. Actualizar
  return await prisma.usuario.update({
    where: { IDUsuario: userId },
    data: { correo: nuevoCorreo }
  });
}
```

**Validación importante:**
- Evita que dos usuarios tengan el mismo correo
- Permite al usuario mantener su propio correo (no hay cambio)

#### `getUserRequests(userId)`
```javascript
async getUserRequests(userId) {
  return await prisma.solicitud.findMany({
    where: { IdUsuario: userId },
    select: {
      NumeroSolicitud: true,
      estado: true,
      creada_en: true,
      // Relaciones anidadas
      tipoSolicitud: { ... },
      centroMedico: { ... },
      detalles: {
        select: {
          lote: {
            select: {
              medicamento: { ... }
            }
          }
        }
      }
    },
    orderBy: { creada_en: 'desc' }  // Más recientes primero
  });
}
```

**Complejidad de relaciones:**
- `Solicitud` → `Detalle_Solicitud` → `Lote` → `Medicamento`
- Prisma maneja automáticamente todos los JOINs

---

### 5️⃣ **src/controllers/userController.js**

**Propósito:** Maneja las peticiones HTTP y las respuestas.

**Patrón MVC:**
```
Request → Controller → Service → Database
                ↓
            Response
```

#### `getProfile(req, res, next)`
```javascript
async getProfile(req, res, next) {
  try {
    // 1. Extraer ID del usuario autenticado
    const userId = req.user.id;  // Viene del middleware de auth
    
    // 2. Llamar al servicio
    const userProfile = await userService.getUserProfile(userId);
    
    // 3. Responder
    res.status(200).json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    // 4. Pasar errores al middleware
    next(error);
  }
}
```

**Responsabilidades del Controller:**
1. ✅ Extraer datos del request (`req.user`, `req.body`, `req.params`)
2. ✅ Llamar al servicio correspondiente
3. ✅ Formatear y enviar la respuesta
4. ✅ Pasar errores al middleware con `next(error)`

**NO debe hacer:**
- ❌ Lógica de negocio
- ❌ Consultas directas a la base de datos
- ❌ Validaciones complejas

#### `updateProfile(req, res, next)`
```javascript
async updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { nombre, apellidos, telefono, correo, direccion, CodigoCiudad } = req.body;
    
    // Obtener usuario actual
    const user = await userService.getUserProfile(userId);
    
    // Validación básica
    if (!user.cedula_usuario) throw error;
    
    // Actualizar correo si cambió
    if (correo && correo !== user.correo) {
      await userService.updateEmail(userId, correo);
    }
    
    // Actualizar datos personales
    await userService.updatePersonalInfo(
      user.cedula_usuario,
      { nombre, apellidos, telefono, direccion, CodigoCiudad }
    );
    
    // Obtener perfil actualizado
    const updatedProfile = await userService.getUserProfile(userId);
    
    res.status(200).json({
      success: true,
      message: 'Perfil actualizado exitosamente',
      data: updatedProfile
    });
  } catch (error) {
    next(error);
  }
}
```

**Flujo de actualización:**
1. Obtener perfil actual
2. Validar que tenga persona asociada
3. Actualizar correo si es necesario (tabla Usuario)
4. Actualizar datos personales (tabla Persona)
5. Obtener y devolver perfil actualizado completo

---

### 6️⃣ **src/routes/userRoutes.js**

**Propósito:** Define los endpoints y aplica middlewares.

```javascript
import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /api/v1/perfil:
 *   get:
 *     summary: Obtener perfil
 *     tags: [Perfil de Usuario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: ...
 */
router.get('/perfil', authMiddleware, userController.getProfile);
```

**Estructura de ruta:**
```
Método HTTP + Path + Middlewares + Controller
    GET     /perfil  authMiddleware  getProfile
```

**Orden de ejecución:**
1. Request llega a `/api/v1/perfil`
2. Se ejecuta `authMiddleware` (valida JWT)
3. Si pasa, se ejecuta `userController.getProfile`
4. Si hay error, se pasa a `errorHandler`

**Anotaciones Swagger:**
- `@swagger`: Marca el inicio de la documentación
- `tags`: Agrupa endpoints en la UI
- `security`: Indica que requiere autenticación
- `responses`: Define posibles respuestas

---

### 7️⃣ **src/middlewares/authMiddleware.js**

**Propósito:** Verificar el token JWT y autenticar al usuario.

```javascript
const authMiddleware = async (req, res, next) => {
  try {
    // 1. Obtener header Authorization
    const authHeader = req.headers.authorization;
    
    // 2. Verificar formato: "Bearer TOKEN"
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw error 401;
    }
    
    // 3. Extraer token
    const token = authHeader.split(' ')[1];
    
    // 4. Verificar token con el secreto
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Adjuntar usuario al request
    req.user = {
      id: decoded.id,
      correo: decoded.correo,
      rol: decoded.rol
    };
    
    // 6. Continuar al siguiente middleware/controller
    next();
  } catch (error) {
    // Manejar errores específicos de JWT
    if (error.name === 'JsonWebTokenError') {
      error.message = 'Token inválido';
    }
    next(error);
  }
};
```

**Flujo:**
```
Request con header Authorization: Bearer eyJhbGc...
    ↓
Extrae token
    ↓
jwt.verify(token, SECRET)
    ↓
Token válido → Adjunta req.user → next()
Token inválido → Error 401
```

**Después de este middleware:**
- `req.user.id` contiene el ID del usuario
- `req.user.correo` contiene el correo
- `req.user.rol` contiene el rol

---

### 8️⃣ **src/middlewares/errorHandler.js**

**Propósito:** Capturar todos los errores y dar respuestas consistentes.

```javascript
const errorHandler = (err, req, res, next) => {
  // Log en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }
  
  // Status code por defecto
  const statusCode = err.statusCode || 500;
  
  // Respuesta base
  const errorResponse = {
    success: false,
    error: {
      message: err.message || 'Error interno del servidor'
    }
  };
  
  // Errores específicos de Prisma
  if (err.code) {
    switch (err.code) {
      case 'P2002':  // Unique constraint violation
        return res.status(409).json({
          success: false,
          error: { message: 'Ya existe un registro con esos datos' }
        });
      case 'P2025':  // Record not found
        return res.status(404).json({
          success: false,
          error: { message: 'Registro no encontrado' }
        });
      // ... más casos
    }
  }
  
  res.status(statusCode).json(errorResponse);
};
```

**Tipos de errores manejados:**
1. **Errores personalizados** (con `statusCode`)
2. **Errores de Prisma** (con códigos P20XX)
3. **Errores de JWT**
4. **Errores genéricos**

**Códigos de Prisma comunes:**
- `P2002`: Violación de unique (ej: correo duplicado)
- `P2025`: Registro no encontrado
- `P2003`: Violación de foreign key

---

### 9️⃣ **src/app.js**

**Propósito:** Configurar la aplicación Express.

**Orden de middlewares (IMPORTANTE):**
```javascript
app.use(cors());                    // 1. CORS primero
app.use(express.json());            // 2. Body parser
app.use(logging);                   // 3. Logging

app.use('/api-docs', swagger);      // 4. Swagger docs

app.get('/health', ...);            // 5. Health check
app.use('/api/v1', userRoutes);     // 6. Rutas de la API

app.use('*', notFound);             // 7. 404 handler
app.use(errorHandler);              // 8. Error handler (ÚLTIMO)
```

**Por qué este orden:**
- CORS debe ir primero para permitir peticiones
- Body parser antes de las rutas que usan `req.body`
- Error handler SIEMPRE al final

---

### 🔟 **src/server.js**

**Propósito:** Iniciar el servidor y manejar el ciclo de vida.

```javascript
import app from './app.js';

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`${signal} recibido, cerrando...`);
  
  server.close(async () => {
    await prisma.$disconnect();  // Cerrar conexión a BD
    process.exit(0);
  });
  
  // Timeout de 10 segundos
  setTimeout(() => {
    process.exit(1);
  }, 10000);
};

// Escuchar señales
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

**Graceful Shutdown:**
1. Recibe señal de terminación (Ctrl+C, etc.)
2. Deja de aceptar nuevas conexiones
3. Espera a que terminen las peticiones en curso
4. Cierra conexión a base de datos
5. Termina el proceso

---

## 🔄 Flujo Completo de una Petición

### Ejemplo: GET /api/v1/perfil

```
1. Cliente envía:
   GET /api/v1/perfil
   Authorization: Bearer eyJhbGc...

2. Express recibe la petición
   ↓
3. CORS middleware
   ↓
4. Body parser middleware
   ↓
5. Router: /api/v1
   ↓
6. authMiddleware
   - Verifica JWT
   - Adjunta req.user
   ↓
7. userController.getProfile
   - Extrae req.user.id
   - Llama userService.getUserProfile(id)
   ↓
8. userService.getUserProfile
   - Consulta Prisma
   - Incluye relaciones (persona, ciudad, provincia, rol)
   - Excluye contraseña
   - Retorna datos
   ↓
9. Controller formatea respuesta
   {
     success: true,
     data: { ... }
   }
   ↓
10. Cliente recibe respuesta 200

Si hay error en cualquier punto:
   ↓
errorHandler
   - Determina statusCode
   - Formatea mensaje
   - Envía respuesta de error
```

---

## 🎓 Conceptos Clave

### 1. Patrón MVC + Services

```
View (Frontend)
    ↕
Controller (maneja HTTP)
    ↕
Service (lógica de negocio)
    ↕
Model (Prisma)
    ↕
Database (PostgreSQL/Supabase)
```

### 2. Middleware Chain

```
req → middleware1 → middleware2 → controller → res
                                      ↓
                                  errorHandler
```

### 3. Prisma Select vs Include

```javascript
// SELECT: Elegir campos específicos
select: {
  nombre: true,
  apellidos: true,
  contraseña: false  // Excluir
}

// INCLUDE: Incluir relaciones completas
include: {
  persona: true,
  rol: true
}

// COMBINADO: Select con relaciones anidadas
select: {
  nombre: true,
  persona: {
    select: {
      ciudad: {
        select: {
          provincia: true
        }
      }
    }
  }
}
```

### 4. Error Handling Pattern

```javascript
try {
  // Operación
} catch (error) {
  // Pasar al middleware de errores
  next(error);
}
```

### 5. JWT Authentication Flow

```
1. Login → Generar JWT con datos del usuario
2. Guardar JWT en cliente (localStorage/cookie)
3. Enviar JWT en cada petición: Authorization: Bearer {token}
4. Middleware verifica JWT
5. Si es válido, adjunta req.user
6. Controller usa req.user.id
```

---

## ✅ Checklist de Implementación

- [x] Base de datos diseñada y creada en Supabase
- [x] Prisma schema definido con todos los modelos
- [x] Servicio de usuario con todas las operaciones
- [x] Controller con manejo de peticiones
- [x] Rutas protegidas con JWT
- [x] Middleware de autenticación
- [x] Middleware de manejo de errores
- [x] Documentación Swagger completa
- [x] Validaciones de seguridad (correo único, sin contraseña)
- [x] Historial de solicitudes implementado
- [x] Alineado con diseño de Figma

---

## 🚀 Próximos Pasos

1. **Probar la API con Swagger:**
   ```
   http://localhost:3000/api-docs
   ```

2. **Implementar autenticación (Login/Register):**
   - POST /api/v1/auth/register
   - POST /api/v1/auth/login

3. **Crear endpoints de solicitudes:**
   - POST /api/v1/solicitudes (crear nueva)
   - GET /api/v1/solicitudes/:id (detalle)

4. **Integrar con frontend:**
   - Configurar CORS específico
   - Probar flujo completo

---

## 📚 Recursos Adicionales

- [Documentación de Prisma](https://www.prisma.io/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [JWT.io](https://jwt.io/)
- [Swagger/OpenAPI Specification](https://swagger.io/specification/)
