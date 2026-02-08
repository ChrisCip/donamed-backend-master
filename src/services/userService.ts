import prisma from '../config/prisma.js';
import type { AppError } from '../types/index.js';

/**
 * Servicio para la gestión de usuarios
 * Basado en el schema real de la base de datos
 */
class UserService {
  /**
   * Obtiene el perfil completo de un usuario por su ID
   * @param userId - ID del usuario
   * @returns Datos del usuario (sin contraseña)
   */
  async getUserProfile(userId: number) {
    const user = await prisma.usuario.findUnique({
      where: { idusuario: userId },
      select: {
        idusuario: true,
        correo: true,
        cedula_usuario: true,
        codigo_rol: true,
        ultimo_ingreso: true,
        estado: true,
        creado_en: true,
        persona: {
          select: {
            cedula: true,
            nombre: true,
            apellidos: true,
            sexo: true,
            fecha_nacimiento: true,
            telefono: true,
            telefono_alternativo: true,
            direccion: true,
            codigociudad: true,
            ciudad: {
              select: {
                codigociudad: true,
                nombre: true,
                codigoprovincia: true,
                provincia: {
                  select: {
                    codigoprovincia: true,
                    nombre: true,
                  },
                },
              },
            },
          },
        },
        rol: {
          select: {
            codigorol: true,
            nombre: true,
          },
        },
      },
    });

    if (!user) {
      const error: AppError = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return user;
  }

  /**
   * Buscar usuario por correo (útil para autenticación)
   */
  async findByEmail(correo: string) {
    return await prisma.usuario.findUnique({
      where: { correo },
      include: {
        persona: true,
        rol: true,
      },
    });
  }

  /**
   * Actualizar información personal del usuario
   */
  async updatePersonalInfo(
    cedula: string,
    data: {
      nombre?: string;
      apellidos?: string;
      telefono?: string;
      telefono_alternativo?: string;
      direccion?: string;
      codigociudad?: string;
    }
  ) {
    return await prisma.persona.update({
      where: { cedula },
      data: { ...data, actualizado_en: new Date() },
      include: { ciudad: { include: { provincia: true } } },
    });
  }

  /**
   * Actualizar correo electrónico del usuario
   */
  async updateEmail(userId: number, nuevoCorreo: string) {
    // Verificar si el correo ya está en uso
    const existingUser = await prisma.usuario.findUnique({
      where: { correo: nuevoCorreo },
    });

    if (existingUser && existingUser.idusuario !== userId) {
      const error: AppError = new Error('El correo electrónico ya está en uso');
      error.statusCode = 409;
      throw error;
    }

    return await prisma.usuario.update({
      where: { idusuario: userId },
      data: { correo: nuevoCorreo, actualizado_en: new Date() },
    });
  }

  /**
   * Obtener historial de solicitudes del usuario
   */
  async getUserRequests(userId: number) {
    return await prisma.solicitud.findMany({
      where: { idusuario: userId },
      select: {
        numerosolicitud: true,
        estado: true,
        creada_en: true,
        patologia: true,
        codigotiposolicitud: true,
        observaciones: true,
        tipo_solicitud: {
          select: {
            descripcion: true,
          },
        },
        centro_medico: {
          select: {
            nombre: true,
          },
        },
        medicamento_solicitado: {
          select: {
            id: true,
            nombre: true,
            dosis: true,
          },
        },
        detalle_solicitud: {
          select: {
            cantidad: true,
            dosis_indicada: true,
            tiempo_tratamiento: true,
            lote: {
              select: {
                codigolote: true,
                medicamento: {
                  select: {
                    nombre: true,
                    codigomedicamento: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { creada_en: 'desc' },
    });
  }
}

export default new UserService();
