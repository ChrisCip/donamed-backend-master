# DONAMED Backend API

Backend del sistema de gestión de donaciones de medicamentos de alto costo para República Dominicana.

## 🚀 Stack Tecnológico

- **Runtime:** Node.js
- **Framework:** Express.js
- **ORM:** Prisma
- **Base de Datos:** PostgreSQL (Supabase)
- **Autenticación:** JWT

## 📁 Estructura del Proyecto

```
donamed-backend/
├── prisma/
│   └── schema.prisma          # Schema de Prisma (modelos de BD)
├── src/
│   ├── config/
│   │   └── prisma.js          # Configuración de PrismaClient
│   ├── controllers/
│   │   └── userController.js  # Controladores de usuario
│   ├── middlewares/
│   │   ├── authMiddleware.js  # Middleware de autenticación JWT
│   │   └── errorHandler.js    # Manejo centralizado de errores
│   ├── routes/
│   │   └── userRoutes.js      # Rutas de usuario
│   ├── services/
│   │   └── userService.js     # Lógica de negocio de usuario
│   ├── utils/
│   │   └── jwt.js             # Utilidades JWT
│   ├── app.js                 # Configuración de Express
│   └── server.js              # Punto de entrada del servidor
├── .env                       # Variables de entorno (NO SUBIR A GIT)
├── .env.example               # Ejemplo de variables de entorno
├── .gitignore
├── package.json
└── README.md
```

## 🔧 Configuración Inicial

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Copiar `.env.example` a `.env` y configurar:

```env
# Supabase Database URLs
DATABASE_URL="postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[PROJECT_REF].supabase.co:5432/postgres"

# Server
PORT=3000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
```

### 3. Generar Prisma Client

```bash
npm run prisma:generate
```

### 4. Verificar conexión con Supabase (Opcional)

```bash
npm run prisma:studio
```

## 🏃‍♂️ Ejecutar el Proyecto

### Modo desarrollo (con auto-reload)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

El servidor estará disponible en: `http://localhost:3000`

## 📡 Endpoints Disponibles

### Health Check

```http
GET /health
```

Verifica que la API esté funcionando correctamente.

### Perfil de Usuario

#### Obtener perfil

```http
GET /api/v1/perfil
Authorization: Bearer {token}
```

**Respuesta exitosa (200):**

```json
{
  "success": true,
  "data": {
    "IDUsuario": 1,
    "correo": "usuario@ejemplo.com",
    "cedula_usuario": "00112345678",
    "codigo_rol": "PACIENTE",
    "persona": {
      "Cedula": "00112345678",
      "nombre": "María",
      "apellidos": "Concepción",
      "sexo": "F",
      "fecha_nacimiento": "1990-01-15",
      "telefono": "809-693-8956",
      "direccion": "Calle Principal #123",
      "ciudad": {
        "CodigoCiudad": 1,
        "nombre": "Santo Domingo",
        "provincia": {
          "CodigoProvincia": 1,
          "nombre": "Distrito Nacional"
        }
      }
    },
    "rol": {
      "CodigoRol": "PACIENTE",
      "nombre": "Paciente"
    }
  }
}
```

#### Actualizar perfil

```http
PUT /api/v1/perfil
Authorization: Bearer {token}
Content-Type: application/json

{
  "telefono": "809-555-1234",
  "direccion": "Nueva dirección",
  "CodigoCiudad": 2
}
```

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para autenticación. 

**Header requerido:**
```
Authorization: Bearer {tu_token_jwt}
```

El token debe incluir:
- `id`: ID del usuario
- `correo`: Correo del usuario
- `rol`: Código del rol

## 🗄️ Base de Datos

La base de datos ya está creada en Supabase usando el script `script.sql`. 

Prisma se conecta a esta base de datos existente y mapea los modelos automáticamente.

## 📝 Comandos Útiles

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Ejecutar en producción
npm start

# Generar Prisma Client
npm run prisma:generate

# Abrir Prisma Studio (GUI para ver datos)
npm run prisma:studio

# Sincronizar schema desde Supabase
npm run prisma:pull
```

## 🏗️ Arquitectura

El proyecto sigue el patrón **MVC + Services**:

- **Controllers**: Manejan las peticiones HTTP (req/res)
- **Services**: Contienen la lógica de negocio
- **Routes**: Definen los endpoints de la API
- **Middlewares**: Procesan peticiones (auth, errors, etc.)
- **Config**: Configuraciones globales (Prisma, etc.)
- **Utils**: Funciones auxiliares reutilizables

## 🔒 Seguridad

- ✅ Contraseñas excluidas de las respuestas
- ✅ Autenticación JWT obligatoria en rutas protegidas
- ✅ Validación de tokens
- ✅ Manejo centralizado de errores
- ✅ CORS configurado

## 🐛 Manejo de Errores

Todos los errores se manejan centralmente en `errorHandler.js`:

- Errores de Prisma (P2002, P2025, etc.)
- Errores de JWT
- Errores personalizados con `statusCode`

## 🤝 Contribuir

1. Crear una rama para tu feature
2. Hacer commits descriptivos
3. Crear Pull Request

## 📄 Licencia

ISC
