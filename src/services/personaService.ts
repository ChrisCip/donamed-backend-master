import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import type { AppError } from '../types/index.js';

/**
 * Servicio para gestión de Usuarios y Personas
 */
class PersonaService {
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
}

export default new PersonaService();
