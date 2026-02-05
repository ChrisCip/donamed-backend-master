# DONAMED Backend - Copilot Instructions

## Architecture Overview
Express.js + TypeScript REST API for managing high-cost medication donations in Dominican Republic. Uses Prisma ORM with PostgreSQL (Supabase).

**Layer flow:** `Routes → Middleware → Controllers → Services → Prisma`

## Project Conventions

### File Structure Pattern
- **Controllers** ([src/controllers/](src/controllers/)): Handle HTTP req/res, delegate to services, pass errors via `next(error)`
- **Services** ([src/services/](src/services/)): Business logic, Prisma queries, throw errors with `statusCode` property
- **Routes** ([src/routes/](src/routes/)): Express routes with Swagger JSDoc annotations
- **Types** ([src/types/index.ts](src/types/index.ts)): Centralized TypeScript interfaces

### Error Handling Pattern
Always throw errors with `statusCode` for proper HTTP responses:
```typescript
const error: AppError = new Error('Usuario no encontrado');
error.statusCode = 404;
throw error;
```
The centralized [errorHandler](src/middlewares/errorHandler.ts) handles Prisma error codes (P2002, P2025, etc.).

### API Response Format
All endpoints return `ApiResponse<T>`:
```typescript
{ success: true, data: T, message?: string, count?: number }
{ success: false, error: { message: string } }
```

### Authentication Pattern
- JWT Bearer token via `Authorization` header
- Use `authMiddleware` to protect routes
- Access user in controllers via `(req as AuthenticatedRequest).user.id`

## Database & Prisma

### Key Models
Schema uses Spanish naming with PascalCase. Main entities in [prisma/schema.prisma](prisma/schema.prisma):
- `Usuario` ↔ `Persona` (1:1 via `cedula_usuario`)
- `Medicamento` → `Lote` → `Donacion_Medicamento`
- `Solicitud` → `Detalle_Solicitud` (medication requests)

### Prisma Commands
```bash
npm run prisma:generate  # After schema changes
npm run prisma:studio    # Visual database browser
npm run prisma:pull      # Sync schema from database
```

## Development Workflow

### Run Development Server
```bash
npm run dev  # tsx watch mode with hot reload
```

### API Documentation
Swagger UI available at `/api-docs` when server runs. Routes use JSDoc annotations:
```typescript
/**
 * @swagger
 * /api/v1/endpoint:
 *   get:
 *     tags: [Tag Name]
 *     security:
 *       - bearerAuth: []
 */
```

### Adding New Endpoints
1. Define types in [src/types/index.ts](src/types/index.ts)
2. Add service method in `src/services/`
3. Add controller method in `src/controllers/`
4. Add route with Swagger docs in `src/routes/`
5. Register route in [src/app.ts](src/app.ts) under `/api/v1`

## Import Conventions
- Use `.js` extension in imports (ES modules): `import x from './file.js'`
- Prisma client from [src/config/prisma.ts](src/config/prisma.ts): `import prisma from '../config/prisma.js'`

## Environment Variables
Required in `.env`: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `PORT`
