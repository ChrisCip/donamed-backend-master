import { Response, NextFunction } from 'express';
import userService from '../services/userService.js';
import type { 
  AuthenticatedRequest, 
  ApiResponse, 
  UserProfile,
  UpdateProfileRequest,
  SolicitudConDetalles 
} from '../types/index.js';

/**
 * Controlador para operaciones relacionadas con usuarios
 */
class UserController {
  /**
   * Obtiene el perfil del usuario autenticado
   * @route GET /api/v1/perfil
   * @access Privado (requiere autenticación)
   */
  async getProfile(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<UserProfile>>,
    next: NextFunction
  ): Promise<void> {
    try {
      // El ID del usuario viene del middleware de autenticación (req.user.id)
      const userId = req.user.id;

      // Llamar al servicio para obtener el perfil completo
      const userProfile = await userService.getUserProfile(userId);

      // Respuesta exitosa
      res.status(200).json({
        success: true,
        data: userProfile
      });
    } catch (error) {
      // Pasar el error al middleware de manejo de errores
      next(error);
    }
  }

  /**
   * Actualiza la información personal del usuario autenticado
   * @route PUT /api/v1/perfil
   * @access Privado (requiere autenticación)
   */
  async updateProfile(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<UserProfile>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user.id;
      const { nombre, apellidos, telefono, correo, direccion, codigociudad } = req.body as UpdateProfileRequest;

      // Primero obtener el usuario para conocer su cédula
      const user = await userService.getUserProfile(userId);

      if (!user.cedula_usuario) {
        const error = new Error('El usuario no tiene una persona asociada') as Error & { statusCode: number };
        error.statusCode = 400;
        throw error;
      }

      // Actualizar correo si se proporcionó
      if (correo && correo !== user.correo) {
        await userService.updateEmail(userId, correo);
      }

      // Actualizar información personal (nombre, apellidos, teléfono, etc.)
      await userService.updatePersonalInfo(
        user.cedula_usuario,
        { nombre, apellidos, telefono, direccion, codigociudad }
      );

      // Obtener perfil actualizado completo
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

  /**
   * Obtiene el historial de solicitudes del usuario autenticado
   * @route GET /api/v1/solicitudes
   * @access Privado (requiere autenticación)
   */
  async getUserRequests(
    req: AuthenticatedRequest,
    res: Response<ApiResponse<SolicitudConDetalles[]>>,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = req.user.id;

      // Obtener historial de solicitudes
      const requests = await userService.getUserRequests(userId);

      res.status(200).json({
        success: true,
        count: requests.length,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new UserController();
