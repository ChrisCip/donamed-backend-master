import jwt, { SignOptions, Secret } from 'jsonwebtoken';
import type { JwtPayload, UsuarioBasico } from '../types/index.js';

/**
 * Genera un token JWT para un usuario
 * @param user - Datos del usuario
 * @returns Token JWT
 */
export const generateToken = (user: UsuarioBasico): string => {
  const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
    id: user.idusuario,
    correo: user.correo,
    rol: user.codigo_rol
  };

  const secret: Secret = process.env.JWT_SECRET || 'default-secret';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';

  return jwt.sign(payload, secret, { expiresIn } as SignOptions);
};

/**
 * Verifica un token JWT
 * @param token - Token a verificar
 * @returns Payload decodificado
 */
export const verifyToken = (token: string): JwtPayload => {
  return jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
};
