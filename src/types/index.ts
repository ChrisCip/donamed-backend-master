import { Request } from 'express';
import type { Prisma } from '@prisma/client';

// ==========================================================
// EXTENDER REQUEST DE EXPRESS CON USUARIO AUTENTICADO
// ==========================================================

export interface AuthUser {
  id: number;
  correo: string;
  rol: number | null;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
}

// ==========================================================
// TIPOS PARA RESPUESTAS DE API
// ==========================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: {
    message: string;
    stack?: string;
  };
}

// ==========================================================
// TIPOS PARA PERFIL DE USUARIO (basados en schema real)
// ==========================================================

export interface CiudadConProvincia {
  codigociudad: string;
  nombre: string;
  codigoprovincia: string;
  provincia: {
    codigoprovincia: string;
    nombre: string;
  };
}

export interface PersonaConCiudad {
  cedula: string;
  nombre: string;
  apellidos: string;
  sexo: 'M' | 'F' | null;
  fecha_nacimiento: Date | null;
  telefono: string | null;
  telefono_alternativo: string | null;
  direccion: string | null;
  codigociudad: string | null;
  ciudad: CiudadConProvincia | null;
}

export interface RolBasico {
  codigorol: number;
  nombre: string;
}

export interface UserProfile {
  idusuario: number;
  correo: string;
  cedula_usuario: string | null;
  codigo_rol: number | null;
  estado: 'ACTIVO' | 'INACTIVO' | 'ELIMINADO' | null;
  creado_en: Date | null;
  persona: PersonaConCiudad | null;
  rol: RolBasico | null;
}

// ==========================================================
// TIPOS PARA ACTUALIZACIÓN DE PERFIL
// ==========================================================

export interface UpdateProfileData {
  nombre?: string;
  apellidos?: string;
  telefono?: string;
  direccion?: string;
  codigociudad?: string;
}

export interface UpdateProfileRequest {
  nombre?: string;
  apellidos?: string;
  telefono?: string;
  correo?: string;
  direccion?: string;
  codigociudad?: string;
}

// ==========================================================
// TIPOS PARA SOLICITUDES
// ==========================================================

export interface MedicamentoBasico {
  nombre: string;
  codigomedicamento: string;
}

export interface LoteConMedicamento {
  codigolote: string;
  medicamento: MedicamentoBasico;
}

export interface DetalleSolicitud {
  cantidad: number;
  dosis_indicada: string | null;
  tiempo_tratamiento: string | null;
  lote: LoteConMedicamento;
}

export interface SolicitudConDetalles {
  numerosolicitud: number;
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'DESPACHADA' | 'EN_REVISION' | 'CANCELADA' | 'INCOMPLETA' | null;
  creada_en: Date | null;
  patologia: string | null;
  codigotiposolicitud: string | null;
  tipo_solicitud: {
    descripcion: string;
  } | null;
  centro_medico: {
    nombre: string;
  } | null;
  detalle_solicitud: DetalleSolicitud[];
}

// ==========================================================
// TIPOS PARA JWT
// ==========================================================

export interface JwtPayload {
  id: number;
  correo: string;
  rol: number | null;
  iat?: number;
  exp?: number;
}

// ==========================================================
// TIPOS PARA ERRORES PERSONALIZADOS
// ==========================================================

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

// ==========================================================
// TIPOS DE PRISMA (para uso en servicios)
// ==========================================================

// Re-exportar el namespace Prisma para queries tipadas
export type { Prisma };

// Tipos básicos para Usuario (usados en JWT)
export interface UsuarioBasico {
  idusuario: number;
  correo: string;
  codigo_rol: number | null;
}

// ==========================================================
// TIPOS PARA ADMINISTRACIÓN - CATÁLOGOS
// ==========================================================

// Provincias
export interface CreateProvinciaRequest {
  codigoprovincia: string;
  nombre: string;
}

// Ciudades
export interface CreateCiudadRequest {
  codigociudad: string;
  nombre: string;
  codigoprovincia: string;
}

// Roles
export interface CreateRolRequest {
  nombre: string;
}

// Categorías
export interface CreateCategoriaRequest {
  nombre: string;
}

// Enfermedades
export interface CreateEnfermedadRequest {
  nombre: string;
}

// Vías de administración
export interface CreateViaAdministracionRequest {
  nombre: string;
}

// Formas farmacéuticas
export interface CreateFormaFarmaceuticaRequest {
  nombre: string;
}

// ==========================================================
// TIPOS PARA ADMINISTRACIÓN - MEDICAMENTOS
// ==========================================================

export interface CreateMedicamentoRequest {
  codigomedicamento: string;
  nombre: string;
  descripcion?: string;
  compuesto_principal?: string;
  idvia_administracion?: number;
  idforma_farmaceutica?: number;
  categorias?: number[];
  enfermedades?: number[];
}

export interface UpdateMedicamentoRequest {
  nombre?: string;
  descripcion?: string;
  compuesto_principal?: string;
  idvia_administracion?: number;
  idforma_farmaceutica?: number;
  estado?: 'ACTIVO' | 'INACTIVO';
  categorias?: number[];
  enfermedades?: number[];
}

// ==========================================================
// TIPOS PARA ADMINISTRACIÓN - LOTES
// ==========================================================

export interface CreateLoteRequest {
  codigomedicamento: string;
  fechavencimiento: string;
  fechafabricacion?: string;
}

// ==========================================================
// TIPOS PARA ADMINISTRACIÓN - ALMACENES
// ==========================================================

export interface CreateAlmacenRequest {
  nombre: string;
  codigociudad?: string;
  direccion?: string;
  telefono: string;
  correo: string;
}

export interface UpdateAlmacenRequest {
  nombre?: string;
  codigociudad?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  estado?: 'ACTIVO' | 'INACTIVO';
}

// ==========================================================
// TIPOS PARA ADMINISTRACIÓN - PROVEEDORES
// ==========================================================

export interface CreateProveedorRequest {
  rncproveedor: string;
  nombre: string;
  telefono?: string;
  correo?: string;
  codigociudad?: string;
  direccion?: string;
}

export interface UpdateProveedorRequest {
  nombre?: string;
  telefono?: string;
  correo?: string;
  codigociudad?: string;
  direccion?: string;
}

// ==========================================================
// TIPOS PARA ADMINISTRACIÓN - CENTROS MÉDICOS
// ==========================================================

export interface CreateCentroMedicoRequest {
  nombre: string;
  direccion?: string;
}

export interface UpdateCentroMedicoRequest {
  nombre?: string;
  direccion?: string;
  estado?: 'ACTIVO' | 'INACTIVO';
}

// ==========================================================
// TIPOS PARA ADMINISTRACIÓN - DONACIONES
// ==========================================================

export interface CreateDonacionRequest {
  proveedor?: string;
  descripcion?: string;
  medicamentos: {
    idalmacen: number;
    codigomedicamento: string;
    fechavencimiento: string;
    fechafabricacion?: string;
    cantidad: number;
  }[];
}

// ==========================================================
// TIPOS PARA ADMINISTRACIÓN - INVENTARIO
// ==========================================================

export interface AjustarInventarioRequest {
  idalmacen: number;
  codigolote: string;
  codigomedicamento: string;
  cantidad: number;
}

// ==========================================================
// TIPOS PARA ADMINISTRACIÓN - SOLICITUDES
// ==========================================================

export interface UpdateSolicitudEstadoRequest {
  estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'DESPACHADA';
}

export interface EvaluateSolicitudRequest {
  estado: 'APROBADA' | 'RECHAZADA';
  detalles?: {
    idalmacen: number;
    codigolote: string;
    cantidad: number;
    dosis_indicada?: string;
    tiempo_tratamiento?: string;
  }[];
}

export interface CreateDespachoRequest {
  numerosolicitud: number;
  cedula_recibe?: string;
}

export interface SolicitudesFilterQuery extends PaginationQuery {
  estado?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'DESPACHADA';
  patologia?: string;
  idcentro?: number;
}

// ==========================================================
// TIPOS PARA ADMINISTRACIÓN - TIPO SOLICITUD
// ==========================================================

export interface CreateTipoSolicitudRequest {
  codigotiposolicitud: string;
  descripcion: string;
}

// ==========================================================
// TIPOS PARA AUTENTICACIÓN ADMIN
// ==========================================================

export interface AdminLoginRequest {
  correo: string;
  contrasena: string;
}

export interface AdminLoginResponse {
  token: string;
  usuario: {
    idusuario: number;
    correo: string;
    codigo_rol: number | null;
    persona: PersonaConCiudad | null;
    rol: RolBasico | null;
  };
}

// ==========================================================
// TIPOS PARA ADMINISTRACIÓN - USUARIOS
// ==========================================================

export interface CreateUsuarioRequest {
  correo: string;
  contrasena: string;
  cedula_usuario?: string;
  codigo_rol?: number;
}

export interface UpdateUsuarioRequest {
  correo?: string;
  codigo_rol?: number;
}

// ==========================================================
// TIPOS PARA PERSONAS
// ==========================================================

export interface CreatePersonaRequest {
  cedula: string;
  nombre: string;
  apellidos: string;
  sexo?: 'M' | 'F';
  fecha_nacimiento?: string;
  telefono?: string;
  telefono_alternativo?: string;
  codigociudad?: string;
  direccion?: string;
}

export interface UpdatePersonaRequest {
  nombre?: string;
  apellidos?: string;
  sexo?: 'M' | 'F';
  fecha_nacimiento?: string;
  telefono?: string;
  telefono_alternativo?: string;
  codigociudad?: string;
  direccion?: string;
}

// ==========================================================
// TIPOS PARA PAGINACIÓN
// ==========================================================

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ==========================================================
// TIPOS PARA DASHBOARD
// ==========================================================

export interface DashboardStats {
  totalMedicamentos: number;
  totalSolicitudesPendientes: number;
  totalUsuarios: number;
  totalDonaciones: number;
  medicamentosVencidos: number;
  medicamentosBajoStock: number;
}
