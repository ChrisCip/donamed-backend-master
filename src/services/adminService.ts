import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
import type { AppError } from '../types/index.js';

/**
 * Servicio administrativo para gestión completa del sistema DONAMED
 * Basado en el schema real de la base de datos (introspección)
 */
class AdminService {
  // ==========================================================
  // AUTENTICACIÓN ADMIN
  // ==========================================================

  /**
   * Login de administrador
   * POST /api/v1/admin/auth/login
   */
  async login(data: { correo: string; contrasena: string }) {
    // Limpiar espacios del correo
    const correoLimpio = data.correo.trim();
    console.log('🔍 Login attempt for:', correoLimpio);
    
    // Buscar usuario con correo exacto o con espacios (LIKE para tolerancia)
    const usuario = await prisma.usuario.findFirst({
      where: {
        OR: [
          { correo: correoLimpio },
          { correo: `${correoLimpio} ` }, // Con espacio al final
          { correo: { contains: correoLimpio } }
        ]
      },
      include: {
        persona: true,
        rol: true,
      },
    });

    console.log('🔍 Usuario encontrado:', usuario ? 'SI' : 'NO');
    if (usuario) {
      console.log('🔍 Contraseña almacenada:', usuario.contrase_a);
      console.log('🔍 Contraseña ingresada:', data.contrasena);
      console.log('🔍 Rol:', usuario.rol);
    }

    if (!usuario) {
      const error: AppError = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // La contraseña está mapeada como contrase_a en Prisma (campo "contraseña" en BD)
    // Verificar si la contraseña está hasheada (bcrypt empieza con $2a$ o $2b$)
    const storedPassword = usuario.contrase_a;
    let passwordValid = false;
    
    if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$')) {
      // Contraseña hasheada - usar bcrypt.compare
      passwordValid = await bcrypt.compare(data.contrasena, storedPassword);
    } else {
      // Contraseña en texto plano - comparación directa
      passwordValid = data.contrasena === storedPassword;
    }
    
    console.log('🔍 Password valid:', passwordValid);
    
    if (!passwordValid) {
      const error: AppError = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    // Verificar que el usuario tiene rol admin
    const adminRoles = ['ADMIN', 'ADMINISTRADOR', 'SUPERADMIN', 'SUPER-ADMIN', 'ALMACENISTA'];
    if (!usuario.rol || !adminRoles.includes(usuario.rol.nombre.toUpperCase())) {
      const error: AppError = new Error('Acceso denegado. Se requieren permisos de administrador.');
      error.statusCode = 403;
      throw error;
    }

    // Actualizar último ingreso
    await prisma.usuario.update({
      where: { idusuario: usuario.idusuario },
      data: { ultimo_ingreso: new Date() },
    });

    const token = generateToken({
      idusuario: usuario.idusuario,
      correo: usuario.correo,
      codigo_rol: usuario.codigo_rol,
    });

    return {
      token,
      usuario: {
        idusuario: usuario.idusuario,
        correo: usuario.correo,
        codigo_rol: usuario.codigo_rol,
        persona: usuario.persona,
        rol: usuario.rol,
      },
    };
  }

  /**
   * Refrescar token
   * POST /api/v1/admin/auth/refresh
   */
  async refreshToken(userId: number) {
    const usuario = await prisma.usuario.findUnique({
      where: { idusuario: userId },
      include: {
        persona: true,
        rol: true,
      },
    });

    if (!usuario) {
      const error: AppError = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const token = generateToken({
      idusuario: usuario.idusuario,
      correo: usuario.correo,
      codigo_rol: usuario.codigo_rol,
    });

    return { token };
  }

  /**
   * Obtener perfil del admin logueado
   * GET /api/v1/admin/auth/me
   */
  async getAdminProfile(userId: number) {
    const usuario = await prisma.usuario.findUnique({
      where: { idusuario: userId },
      include: {
        persona: true,
        rol: true,
      },
    });

    if (!usuario) {
      const error: AppError = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return usuario;
  }

  // ==========================================================
  // PROVINCIAS
  // ==========================================================

  async getProvincias() {
    return await prisma.provincia.findMany({
      include: { ciudad: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async createProvincia(data: { codigoprovincia: string; nombre: string }) {
    return await prisma.provincia.create({ data });
  }

  async updateProvincia(codigoprovincia: string, data: { nombre: string }) {
    return await prisma.provincia.update({
      where: { codigoprovincia },
      data,
    });
  }

  async deleteProvincia(codigoprovincia: string) {
    return await prisma.provincia.delete({
      where: { codigoprovincia },
    });
  }

  // ==========================================================
  // CIUDADES
  // ==========================================================

  async getCiudades(codigoprovincia?: string) {
    return await prisma.ciudad.findMany({
      where: codigoprovincia ? { codigoprovincia } : undefined,
      include: { provincia: true },
      orderBy: { nombre: 'asc' },
    });
  }

  async createCiudad(data: { codigociudad: string; nombre: string; codigoprovincia: string }) {
    return await prisma.ciudad.create({
      data,
      include: { provincia: true },
    });
  }

  async updateCiudad(codigociudad: string, data: { nombre?: string; codigoprovincia?: string }) {
    return await prisma.ciudad.update({
      where: { codigociudad },
      data,
      include: { provincia: true },
    });
  }

  async deleteCiudad(codigociudad: string) {
    return await prisma.ciudad.delete({
      where: { codigociudad },
    });
  }

  // ==========================================================
  // ROLES
  // ==========================================================

  async getRoles() {
    return await prisma.rol.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async createRol(data: { nombre: string }) {
    return await prisma.rol.create({ data });
  }

  async updateRol(codigorol: number, data: { nombre: string }) {
    return await prisma.rol.update({
      where: { codigorol },
      data,
    });
  }

  async deleteRol(codigorol: number) {
    return await prisma.rol.delete({
      where: { codigorol },
    });
  }

  // ==========================================================
  // CATEGORÍAS
  // ==========================================================

  async getCategorias() {
    return await prisma.categoria.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async createCategoria(data: { nombre: string }) {
    return await prisma.categoria.create({ data });
  }

  async updateCategoria(idcategoria: number, data: { nombre: string }) {
    return await prisma.categoria.update({
      where: { idcategoria },
      data,
    });
  }

  async deleteCategoria(idcategoria: number) {
    return await prisma.categoria.delete({
      where: { idcategoria },
    });
  }

  // ==========================================================
  // ENFERMEDADES
  // ==========================================================

  async getEnfermedades() {
    return await prisma.enfermedad.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async createEnfermedad(data: { nombre: string }) {
    return await prisma.enfermedad.create({ data });
  }

  async updateEnfermedad(idenfermedad: number, data: { nombre: string }) {
    return await prisma.enfermedad.update({
      where: { idenfermedad },
      data,
    });
  }

  async deleteEnfermedad(idenfermedad: number) {
    return await prisma.enfermedad.delete({
      where: { idenfermedad },
    });
  }

  // ==========================================================
  // VÍAS DE ADMINISTRACIÓN
  // ==========================================================

  async getViasAdministracion() {
    return await prisma.via_administracion.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async createViaAdministracion(data: { nombre: string }) {
    return await prisma.via_administracion.create({ data });
  }

  async updateViaAdministracion(idvia: number, data: { nombre: string }) {
    return await prisma.via_administracion.update({
      where: { idvia },
      data,
    });
  }

  async deleteViaAdministracion(idvia: number) {
    return await prisma.via_administracion.delete({
      where: { idvia },
    });
  }

  // ==========================================================
  // FORMAS FARMACÉUTICAS
  // ==========================================================

  async getFormasFarmaceuticas() {
    return await prisma.forma_farmaceutica.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async createFormaFarmaceutica(data: { nombre: string }) {
    return await prisma.forma_farmaceutica.create({ data });
  }

  async updateFormaFarmaceutica(idformafarmaceutica: number, data: { nombre: string }) {
    return await prisma.forma_farmaceutica.update({
      where: { idformafarmaceutica },
      data,
    });
  }

  async deleteFormaFarmaceutica(idformafarmaceutica: number) {
    return await prisma.forma_farmaceutica.delete({
      where: { idformafarmaceutica },
    });
  }

  // ==========================================================
  // MEDICAMENTOS
  // ==========================================================

  async getMedicamentos(query: { page?: number; limit?: number; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where = query.search
      ? {
          OR: [
            { nombre: { contains: query.search, mode: 'insensitive' as const } },
            { codigomedicamento: { contains: query.search, mode: 'insensitive' as const } },
            { compuesto_principal: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const [medicamentos, total] = await Promise.all([
      prisma.medicamento.findMany({
        where,
        include: {
          via_administracion: true,
          forma_farmaceutica: true,
          categoria_medicamento: { include: { categoria: true } },
          enfermedad_medicamento: { include: { enfermedad: true } },
        },
        skip,
        take: limit,
        orderBy: { nombre: 'asc' },
      }),
      prisma.medicamento.count({ where }),
    ]);

    return {
      data: medicamentos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getMedicamentoById(codigomedicamento: string) {
    const medicamento = await prisma.medicamento.findUnique({
      where: { codigomedicamento },
      include: {
        via_administracion: true,
        forma_farmaceutica: true,
        categoria_medicamento: { include: { categoria: true } },
        enfermedad_medicamento: { include: { enfermedad: true } },
        lote: {
          include: {
            almacen_medicamento: { include: { almacen: true } },
          },
          orderBy: { fechavencimiento: 'asc' },
        },
      },
    });

    if (!medicamento) {
      const error: AppError = new Error('Medicamento no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return medicamento;
  }

  async createMedicamento(data: {
    codigomedicamento: string;
    nombre: string;
    descripcion?: string;
    compuesto_principal?: string;
    idvia_administracion?: number;
    idforma_farmaceutica?: number;
    categorias?: number[];
    enfermedades?: number[];
  }) {
    const { categorias, enfermedades, ...medicamentoData } = data;

    return await prisma.medicamento.create({
      data: {
        ...medicamentoData,
        categoria_medicamento: categorias?.length
          ? {
              create: categorias.map((idcategoria) => ({ idcategoria })),
            }
          : undefined,
        enfermedad_medicamento: enfermedades?.length
          ? {
              create: enfermedades.map((idenfermedad) => ({ idenfermedad })),
            }
          : undefined,
      },
      include: {
        via_administracion: true,
        forma_farmaceutica: true,
        categoria_medicamento: { include: { categoria: true } },
        enfermedad_medicamento: { include: { enfermedad: true } },
      },
    });
  }

  async updateMedicamento(
    codigomedicamento: string,
    data: {
      nombre?: string;
      descripcion?: string;
      compuesto_principal?: string;
      idvia_administracion?: number;
      idforma_farmaceutica?: number;
      estado?: 'ACTIVO' | 'INACTIVO';
    }
  ) {
    return await prisma.medicamento.update({
      where: { codigomedicamento },
      data,
      include: {
        via_administracion: true,
        forma_farmaceutica: true,
        categoria_medicamento: { include: { categoria: true } },
        enfermedad_medicamento: { include: { enfermedad: true } },
      },
    });
  }

  async deleteMedicamento(codigomedicamento: string) {
    // Eliminar relaciones primero
    await prisma.categoria_medicamento.deleteMany({ where: { codigomedicamento } });
    await prisma.enfermedad_medicamento.deleteMany({ where: { codigomedicamento } });

    return await prisma.medicamento.delete({
      where: { codigomedicamento },
    });
  }

  // ==========================================================
  // LOTES
  // ==========================================================

  async getLotes(query: { page?: number; limit?: number; codigomedicamento?: string; vencidos?: boolean }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.codigomedicamento) {
      where.codigomedicamento = query.codigomedicamento;
    }
    if (query.vencidos === true) {
      where.fechavencimiento = { lt: new Date() };
    } else if (query.vencidos === false) {
      where.fechavencimiento = { gte: new Date() };
    }

    const [lotes, total] = await Promise.all([
      prisma.lote.findMany({
        where,
        include: {
          medicamento: true,
          almacen_medicamento: { include: { almacen: true } },
        },
        skip,
        take: limit,
        orderBy: { fechavencimiento: 'asc' },
      }),
      prisma.lote.count({ where }),
    ]);

    return {
      data: lotes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createLote(data: {
    codigolote: string;
    codigomedicamento: string;
    fechavencimiento: Date;
    fechafabricacion?: Date;
  }) {
    return await prisma.lote.create({
      data,
      include: { medicamento: true },
    });
  }

  async deleteLote(codigolote: string) {
    return await prisma.lote.delete({
      where: { codigolote },
    });
  }

  // ==========================================================
  // ALMACENES
  // ==========================================================

  async getAlmacenes() {
    return await prisma.almacen.findMany({
      include: { ciudad: { include: { provincia: true } } },
      orderBy: { nombre: 'asc' },
    });
  }

  async getAlmacenById(idalmacen: number) {
    const almacen = await prisma.almacen.findUnique({
      where: { idalmacen },
      include: {
        ciudad: { include: { provincia: true } },
        almacen_medicamento: {
          include: {
            medicamento: true,
            lote: true,
          },
        },
      },
    });

    if (!almacen) {
      const error: AppError = new Error('Almacén no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return almacen;
  }

  async createAlmacen(data: {
    nombre: string;
    codigociudad?: string;
    direccion?: string;
    telefono: string;
    correo: string;
  }) {
    return await prisma.almacen.create({
      data,
      include: { ciudad: { include: { provincia: true } } },
    });
  }

  async updateAlmacen(
    idalmacen: number,
    data: {
      nombre?: string;
      codigociudad?: string;
      direccion?: string;
      telefono?: string;
      correo?: string;
      estado?: 'ACTIVO' | 'INACTIVO';
    }
  ) {
    return await prisma.almacen.update({
      where: { idalmacen },
      data,
      include: { ciudad: { include: { provincia: true } } },
    });
  }

  async deleteAlmacen(idalmacen: number) {
    return await prisma.almacen.delete({
      where: { idalmacen },
    });
  }

  // ==========================================================
  // PROVEEDORES
  // ==========================================================

  async getProveedores() {
    return await prisma.proveedor.findMany({
      include: { ciudad: { include: { provincia: true } } },
      orderBy: { nombre: 'asc' },
    });
  }

  async getProveedorById(rncproveedor: string) {
    const proveedor = await prisma.proveedor.findUnique({
      where: { rncproveedor },
      include: {
        ciudad: { include: { provincia: true } },
        donaciones_donaciones_proveedorToproveedor: true,
      },
    });

    if (!proveedor) {
      const error: AppError = new Error('Proveedor no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return proveedor;
  }

  async createProveedor(data: {
    rncproveedor: string;
    nombre: string;
    telefono?: string;
    correo?: string;
    codigociudad?: string;
    direccion?: string;
  }) {
    return await prisma.proveedor.create({
      data,
      include: { ciudad: { include: { provincia: true } } },
    });
  }

  async updateProveedor(
    rncproveedor: string,
    data: {
      nombre?: string;
      telefono?: string;
      correo?: string;
      codigociudad?: string;
      direccion?: string;
    }
  ) {
    return await prisma.proveedor.update({
      where: { rncproveedor },
      data,
      include: { ciudad: { include: { provincia: true } } },
    });
  }

  async deleteProveedor(rncproveedor: string) {
    return await prisma.proveedor.delete({
      where: { rncproveedor },
    });
  }

  // ==========================================================
  // CENTROS MÉDICOS
  // ==========================================================

  async getCentrosMedicos() {
    return await prisma.centro_medico.findMany({
      orderBy: { nombre: 'asc' },
    });
  }

  async getCentroMedicoById(idcentro: number) {
    const centro = await prisma.centro_medico.findUnique({
      where: { idcentro },
      include: { solicitud: true },
    });

    if (!centro) {
      const error: AppError = new Error('Centro médico no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return centro;
  }

  async createCentroMedico(data: { nombre: string; direccion?: string }) {
    return await prisma.centro_medico.create({ data });
  }

  async updateCentroMedico(
    idcentro: number,
    data: { nombre?: string; direccion?: string; estado?: 'ACTIVO' | 'INACTIVO' }
  ) {
    return await prisma.centro_medico.update({
      where: { idcentro },
      data,
    });
  }

  async deleteCentroMedico(idcentro: number) {
    return await prisma.centro_medico.delete({
      where: { idcentro },
    });
  }

  // ==========================================================
  // DONACIONES
  // ==========================================================

  async getDonaciones(query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [donaciones, total] = await Promise.all([
      prisma.donaciones.findMany({
        include: {
          proveedor_donaciones_proveedorToproveedor: true,
          donacion_medicamento: {
            include: {
              lote: { include: { medicamento: true } },
              almacen: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { fecha_recibida: 'desc' },
      }),
      prisma.donaciones.count(),
    ]);

    return {
      data: donaciones,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createDonacion(data: {
    proveedor?: string;
    descripcion?: string;
    medicamentos: Array<{
      idalmacen: number;
      codigolote: string;
      cantidad: number;
    }>;
  }) {
    const { medicamentos, ...donacionData } = data;

    return await prisma.donaciones.create({
      data: {
        ...donacionData,
        donacion_medicamento: {
          create: medicamentos,
        },
      },
      include: {
        proveedor_donaciones_proveedorToproveedor: true,
        donacion_medicamento: {
          include: {
            lote: { include: { medicamento: true } },
            almacen: true,
          },
        },
      },
    });
  }

  // ==========================================================
  // INVENTARIO
  // ==========================================================

  async getInventario(query: { idalmacen?: number; codigomedicamento?: string }) {
    const where: Record<string, unknown> = {};
    if (query.idalmacen) where.idalmacen = query.idalmacen;
    if (query.codigomedicamento) where.codigomedicamento = query.codigomedicamento;

    return await prisma.almacen_medicamento.findMany({
      where,
      include: {
        almacen: true,
        medicamento: true,
        lote: true,
      },
    });
  }

  async ajustarInventario(data: {
    idalmacen: number;
    codigolote: string;
    codigomedicamento: string;
    cantidad: number;
  }) {
    return await prisma.almacen_medicamento.upsert({
      where: {
        idalmacen_codigomedicamento_codigolote: {
          idalmacen: data.idalmacen,
          codigomedicamento: data.codigomedicamento,
          codigolote: data.codigolote,
        },
      },
      update: { cantidad: data.cantidad },
      create: data,
      include: {
        almacen: true,
        medicamento: true,
        lote: true,
      },
    });
  }

  // ==========================================================
  // TIPOS DE SOLICITUD
  // ==========================================================

  async getTiposSolicitud() {
    return await prisma.tipo_solicitud.findMany({
      orderBy: { descripcion: 'asc' },
    });
  }

  async createTipoSolicitud(data: { codigotiposolicitud: string; descripcion: string }) {
    return await prisma.tipo_solicitud.create({ data });
  }

  async updateTipoSolicitud(codigotiposolicitud: string, data: { descripcion: string }) {
    return await prisma.tipo_solicitud.update({
      where: { codigotiposolicitud },
      data,
    });
  }

  async deleteTipoSolicitud(codigotiposolicitud: string) {
    return await prisma.tipo_solicitud.delete({
      where: { codigotiposolicitud },
    });
  }

  // ==========================================================
  // SOLICITUDES
  // ==========================================================

  async getSolicitudes(query: {
    page?: number;
    limit?: number;
    estado?: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'DESPACHADA';
  }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where = query.estado ? { estado: query.estado } : undefined;

    const [solicitudes, total] = await Promise.all([
      prisma.solicitud.findMany({
        where,
        include: {
          usuario: { include: { persona: true } },
          persona: true,
          tipo_solicitud: true,
          centro_medico: true,
          detalle_solicitud: {
            include: {
              lote: { include: { medicamento: true } },
              almacen: true,
            },
          },
          despacho_despacho_solicitudTosolicitud: true,
        },
        skip,
        take: limit,
        orderBy: { creada_en: 'desc' },
      }),
      prisma.solicitud.count({ where }),
    ]);

    return {
      data: solicitudes,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getSolicitudById(numerosolicitud: number) {
    const solicitud = await prisma.solicitud.findUnique({
      where: { numerosolicitud },
      include: {
        usuario: { include: { persona: true } },
        persona: true,
        tipo_solicitud: true,
        centro_medico: true,
        detalle_solicitud: {
          include: {
            lote: { include: { medicamento: true } },
            almacen: true,
          },
        },
        despacho_despacho_solicitudTosolicitud: { include: { persona: true } },
      },
    });

    if (!solicitud) {
      const error: AppError = new Error('Solicitud no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return solicitud;
  }

  async updateSolicitudEstado(
    numerosolicitud: number,
    data: { estado: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA' | 'DESPACHADA' }
  ) {
    return await prisma.solicitud.update({
      where: { numerosolicitud },
      data: { estado: data.estado, actualizado_en: new Date() },
      include: {
        usuario: { include: { persona: true } },
        tipo_solicitud: true,
        detalle_solicitud: true,
      },
    });
  }

  // ==========================================================
  // DESPACHOS
  // ==========================================================

  async getDespachos(query: { page?: number; limit?: number }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const [despachos, total] = await Promise.all([
      prisma.despacho.findMany({
        include: {
          solicitud_despacho_solicitudTosolicitud: {
            include: {
              usuario: { include: { persona: true } },
              detalle_solicitud: {
                include: {
                  lote: { include: { medicamento: true } },
                },
              },
            },
          },
          persona: true,
        },
        skip,
        take: limit,
        orderBy: { fecha_despacho: 'desc' },
      }),
      prisma.despacho.count(),
    ]);

    return {
      data: despachos,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async createDespacho(data: { solicitud: number; cedula_recibe?: string }) {
    // Verificar que la solicitud existe y está aprobada
    const solicitud = await prisma.solicitud.findUnique({
      where: { numerosolicitud: data.solicitud },
    });

    if (!solicitud) {
      const error: AppError = new Error('Solicitud no encontrada');
      error.statusCode = 404;
      throw error;
    }

    if (solicitud.estado !== 'APROBADA') {
      const error: AppError = new Error('La solicitud debe estar aprobada para despachar');
      error.statusCode = 400;
      throw error;
    }

    // Crear despacho y actualizar estado de solicitud
    const [despacho] = await prisma.$transaction([
      prisma.despacho.create({
        data,
        include: {
          solicitud_despacho_solicitudTosolicitud: true,
          persona: true,
        },
      }),
      prisma.solicitud.update({
        where: { numerosolicitud: data.solicitud },
        data: { estado: 'DESPACHADA', actualizado_en: new Date() },
      }),
    ]);

    return despacho;
  }

  // ==========================================================
  // USUARIOS
  // ==========================================================

  async getUsuarios(query: { page?: number; limit?: number; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where = query.search
      ? {
          OR: [
            { correo: { contains: query.search, mode: 'insensitive' as const } },
            { persona: { nombre: { contains: query.search, mode: 'insensitive' as const } } },
            { persona: { apellidos: { contains: query.search, mode: 'insensitive' as const } } },
          ],
        }
      : undefined;

    const [usuarios, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        include: {
          persona: true,
          rol: true,
        },
        skip,
        take: limit,
        orderBy: { creado_en: 'desc' },
      }),
      prisma.usuario.count({ where }),
    ]);

    return {
      data: usuarios,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUsuarioById(idusuario: number) {
    const usuario = await prisma.usuario.findUnique({
      where: { idusuario },
      include: {
        persona: true,
        rol: true,
        solicitud: true,
      },
    });

    if (!usuario) {
      const error: AppError = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return usuario;
  }

  async createUsuario(data: {
    correo: string;
    contrasena: string;
    cedula_usuario?: string;
    codigo_rol?: number;
  }) {
    const hashedPassword = await bcrypt.hash(data.contrasena, 10);

    return await prisma.usuario.create({
      data: {
        correo: data.correo,
        contrase_a: hashedPassword,
        cedula_usuario: data.cedula_usuario,
        codigo_rol: data.codigo_rol,
      },
      include: {
        persona: true,
        rol: true,
      },
    });
  }

  async updateUsuario(
    idusuario: number,
    data: {
      correo?: string;
      contrasena?: string;
      codigo_rol?: number;
      estado?: 'ACTIVO' | 'INACTIVO';
    }
  ) {
    const updateData: Record<string, unknown> = { actualizado_en: new Date() };

    if (data.correo) updateData.correo = data.correo;
    if (data.codigo_rol) updateData.codigo_rol = data.codigo_rol;
    if (data.estado) updateData.estado = data.estado;
    if (data.contrasena) {
      updateData.contrase_a = await bcrypt.hash(data.contrasena, 10);
    }

    return await prisma.usuario.update({
      where: { idusuario },
      data: updateData,
      include: {
        persona: true,
        rol: true,
      },
    });
  }

  async deleteUsuario(idusuario: number) {
    return await prisma.usuario.delete({
      where: { idusuario },
    });
  }

  // ==========================================================
  // PERSONAS
  // ==========================================================

  async getPersonas(query: { page?: number; limit?: number; search?: string }) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where = query.search
      ? {
          OR: [
            { nombre: { contains: query.search, mode: 'insensitive' as const } },
            { apellidos: { contains: query.search, mode: 'insensitive' as const } },
            { cedula: { contains: query.search, mode: 'insensitive' as const } },
          ],
        }
      : undefined;

    const [personas, total] = await Promise.all([
      prisma.persona.findMany({
        where,
        include: {
          ciudad: { include: { provincia: true } },
        },
        skip,
        take: limit,
        orderBy: { nombre: 'asc' },
      }),
      prisma.persona.count({ where }),
    ]);

    return {
      data: personas,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getPersonaByCedula(cedula: string) {
    const persona = await prisma.persona.findUnique({
      where: { cedula },
      include: {
        ciudad: { include: { provincia: true } },
        usuario: true,
      },
    });

    if (!persona) {
      const error: AppError = new Error('Persona no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return persona;
  }

  async createPersona(data: {
    cedula: string;
    nombre: string;
    apellidos: string;
    sexo?: 'M' | 'F';
    fecha_nacimiento?: Date;
    telefono?: string;
    telefono_alternativo?: string;
    codigociudad?: string;
    direccion?: string;
  }) {
    return await prisma.persona.create({
      data,
      include: { ciudad: { include: { provincia: true } } },
    });
  }

  async updatePersona(
    cedula: string,
    data: {
      nombre?: string;
      apellidos?: string;
      sexo?: 'M' | 'F';
      fecha_nacimiento?: Date;
      telefono?: string;
      telefono_alternativo?: string;
      codigociudad?: string;
      direccion?: string;
    }
  ) {
    return await prisma.persona.update({
      where: { cedula },
      data: { ...data, actualizado_en: new Date() },
      include: { ciudad: { include: { provincia: true } } },
    });
  }

  // ==========================================================
  // DASHBOARD / ESTADÍSTICAS
  // ==========================================================

  async getDashboardStats() {
    const [
      totalMedicamentos,
      totalSolicitudesPendientes,
      totalUsuarios,
      totalAlmacenes,
      medicamentosActivos,
      lotesProximosVencer,
    ] = await Promise.all([
      prisma.medicamento.count(),
      prisma.solicitud.count({ where: { estado: 'PENDIENTE' } }),
      prisma.usuario.count({ where: { estado: 'ACTIVO' } }),
      prisma.almacen.count({ where: { estado: 'ACTIVO' } }),
      prisma.medicamento.count({ where: { estado: 'ACTIVO' } }),
      prisma.lote.count({
        where: {
          fechavencimiento: {
            lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
            gte: new Date(),
          },
        },
      }),
    ]);

    return {
      totalMedicamentos,
      medicamentosActivos,
      totalSolicitudesPendientes,
      totalUsuarios,
      totalAlmacenes,
      lotesProximosVencer,
    };
  }
}

export default new AdminService();
