/**
 * Utilidades de validación
 */

/**
 * Valida que una cédula dominicana tenga 11 dígitos
 * @param cedula - Cédula a validar
 * @returns true si la cédula es válida
 */
export function validarCedula(cedula: string): boolean {
  if (!cedula) return false;
  
  // Eliminar guiones y espacios
  const cedulaLimpia = cedula.replace(/[-\s]/g, '');
  
  // Verificar que tenga exactamente 11 dígitos numéricos
  if (!/^\d{11}$/.test(cedulaLimpia)) {
    return false;
  }
  
  return true;
}

/**
 * Valida y formatea una cédula dominicana
 * @param cedula - Cédula a validar y formatear
 * @returns Cédula limpia (solo números) o null si es inválida
 */
export function formatearCedula(cedula: string): string | null {
  if (!cedula) return null;
  
  // Eliminar guiones y espacios
  const cedulaLimpia = cedula.replace(/[-\s]/g, '');
  
  // Verificar que tenga exactamente 11 dígitos numéricos
  if (!/^\d{11}$/.test(cedulaLimpia)) {
    return null;
  }
  
  return cedulaLimpia;
}

/**
 * Valida un RNC dominicano (9 dígitos para empresas)
 * @param rnc - RNC a validar
 * @returns true si el RNC es válido
 */
export function validarRNC(rnc: string): boolean {
  if (!rnc) return false;
  
  // Eliminar guiones y espacios
  const rncLimpio = rnc.replace(/[-\s]/g, '');
  
  // Verificar que tenga 9 dígitos (RNC) o 11 dígitos (cédula)
  if (!/^\d{9}$/.test(rncLimpio) && !/^\d{11}$/.test(rncLimpio)) {
    return false;
  }
  
  return true;
}

/**
 * Valida que un string no esté vacío
 * @param value - Valor a validar
 * @returns true si el valor no está vacío
 */
export function validarNoVacio(value: string | undefined | null): boolean {
  return value !== undefined && value !== null && value.trim().length > 0;
}

/**
 * Valida un correo electrónico
 * @param correo - Correo a validar
 * @returns true si el correo es válido
 */
export function validarCorreo(correo: string): boolean {
  if (!correo) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(correo);
}

/**
 * Valida un número de teléfono dominicano
 * @param telefono - Teléfono a validar
 * @returns true si el teléfono es válido
 */
export function validarTelefono(telefono: string): boolean {
  if (!telefono) return false;
  
  // Eliminar guiones, espacios y paréntesis
  const telefonoLimpio = telefono.replace(/[-\s()]/g, '');
  
  // Verificar que tenga al menos 10 dígitos
  return /^\d{10,}$/.test(telefonoLimpio);
}
