import { Resend } from 'resend';

// ==========================================================
// CONFIGURACIÓN DE RESEND
// ==========================================================

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'DONAMED <onboarding@resend.dev>';

// ==========================================================
// TEMPLATES HTML — NOTIFICACIONES DE SOLICITUD
// ==========================================================

/**
 * Colores por estado para el badge del email
 */
const ESTADO_CONFIG: Record<string, { color: string; bgColor: string; emoji: string; label: string }> = {
  APROBADA: { color: '#166534', bgColor: '#dcfce7', emoji: '✅', label: 'Aprobada' },
  RECHAZADA: { color: '#991b1b', bgColor: '#fee2e2', emoji: '❌', label: 'Rechazada' },
  DESPACHADA: { color: '#7c2d12', bgColor: '#ffedd5', emoji: '📦', label: 'Despachada' },
  CANCELADA: { color: '#71717a', bgColor: '#f4f4f5', emoji: '🚫', label: 'Cancelada' },
};

/**
 * Genera el mensaje principal según el estado
 */
function getMensajePorEstado(estado: string, numerosolicitud: number): string {
  switch (estado) {
    case 'APROBADA':
      return `¡Buenas noticias! Tu solicitud <strong>#${numerosolicitud}</strong> ha sido <strong>aprobada</strong>. Recibirás una notificación cuando tus medicamentos estén listos para ser retirados.`;
    case 'RECHAZADA':
      return `Lamentamos informarte que tu solicitud <strong>#${numerosolicitud}</strong> ha sido <strong>rechazada</strong>. Revisa las observaciones del equipo a continuación.`;
    case 'DESPACHADA':
      return `Tu solicitud <strong>#${numerosolicitud}</strong> ha sido <strong>despachada</strong>. Ya puedes pasar a retirar tus medicamentos en el almacén asignado.`;
    case 'CANCELADA':
      return `Tu solicitud <strong>#${numerosolicitud}</strong> ha sido <strong>cancelada</strong>. Revisa las observaciones a continuación. Si lo necesitas, puedes crear una nueva solicitud.`;
    default:
      return `El estado de tu solicitud <strong>#${numerosolicitud}</strong> ha sido actualizado.`;
  }
}

/**
 * Template HTML para notificación de cambio de estado de solicitud
 */
function solicitudStatusEmailHtml(params: {
  nombre: string;
  numerosolicitud: number;
  estado: string;
  observaciones?: string | null;
  almacenRetiro?: string | null;
}): string {
  const config = ESTADO_CONFIG[params.estado] || { color: '#475569', bgColor: '#f1f5f9', emoji: '📋', label: params.estado };
  const mensaje = getMensajePorEstado(params.estado, params.numerosolicitud);

  // Bloque de observaciones (solo si hay)
  const observacionesHtml = params.observaciones
    ? `
        <div style="margin-top:24px;padding:16px;background:#f8fafc;border-radius:8px;border-left:4px solid #64748b;">
          <p style="color:#475569;font-size:13px;margin:0 0 4px;font-weight:600;">📝 Observaciones del equipo:</p>
          <p style="color:#64748b;font-size:14px;margin:0;line-height:1.5;">${params.observaciones}</p>
        </div>`
    : '';

  // Bloque de almacén de retiro (solo para APROBADA y DESPACHADA)
  const almacenHtml = params.almacenRetiro && (params.estado === 'APROBADA' || params.estado === 'DESPACHADA')
    ? `
        <div style="margin-top:16px;padding:16px;background:#f0fdf4;border-radius:8px;border-left:4px solid #22c55e;">
          <p style="color:#166534;font-size:13px;margin:0;">
            🏬 <strong>Lugar de retiro:</strong> ${params.almacenRetiro}
          </p>
        </div>`
    : '';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
    <div style="max-width:560px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 6px rgba(0,0,0,0.07);">
      <div style="background:linear-gradient(135deg,#0ea5e9,#2563eb);padding:32px 24px;text-align:center;">
        <h1 style="color:#ffffff;margin:0;font-size:24px;">🏥 DONAMED</h1>
        <p style="color:#e0f2fe;margin:8px 0 0;font-size:14px;">Sistema de Donación de Medicamentos</p>
      </div>
      <div style="padding:32px 24px;">
        <h2 style="color:#1e293b;margin:0 0 16px;font-size:20px;">Hola ${params.nombre},</h2>
        
        <div style="text-align:center;margin:20px 0;">
          <span style="display:inline-block;background:${config.bgColor};color:${config.color};padding:8px 20px;border-radius:20px;font-size:14px;font-weight:600;">
            ${config.emoji} Solicitud #${params.numerosolicitud} — ${config.label}
          </span>
        </div>

        <p style="color:#475569;font-size:15px;line-height:1.6;margin:16px 0 0;">
          ${mensaje}
        </p>
        ${observacionesHtml}
        ${almacenHtml}
      </div>
      <div style="background:#f8fafc;padding:20px 24px;text-align:center;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">© ${new Date().getFullYear()} DONAMED — República Dominicana</p>
      </div>
    </div>
  </body>
  </html>`;
}

// ==========================================================
// FUNCIONES DE ENVÍO
// ==========================================================

/**
 * Envía notificación de cambio de estado de solicitud al paciente
 */
export async function sendSolicitudStatusEmail(params: {
  to: string;
  nombre: string;
  numerosolicitud: number;
  estado: string;
  observaciones?: string | null;
  almacenRetiro?: string | null;
}): Promise<void> {
  const config = ESTADO_CONFIG[params.estado];
  if (!config) {
    console.warn(`Estado ${params.estado} no tiene template de email, no se envía notificación.`);
    return;
  }

  const subject = `${config.emoji} Solicitud #${params.numerosolicitud} — ${config.label} — DONAMED`;

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject,
    html: solicitudStatusEmailHtml(params),
  });

  if (error) {
    console.error(`Error enviando email de estado ${params.estado}:`, error);
    // No lanzamos error para no bloquear el cambio de estado
    return;
  }

  console.log(`📧 Email de estado ${params.estado} enviado a: ${params.to} (Solicitud #${params.numerosolicitud})`);
}
