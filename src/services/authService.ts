import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import { generateToken } from '../utils/jwt.js';
import type { AppError } from '../types/index.js';

/**
 * Servicio de Autenticación para Administradores
 */
class AuthService {
  // ==========================================================
  // AUTENTICACIÓN ADMIN
  // ==========================================================

  /**
   * Login de administrador
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
}

export default new AuthService();
