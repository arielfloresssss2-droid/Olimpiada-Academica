import { EMAILJS_CONFIG } from "../config/emailjs";

export interface ResetSessionData {
  email: string;
  passcode: string;
  expiresAt: number;
  timeFormatted: string;
  verified?: boolean;
}

export interface RegisterSessionData {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  passcode: string;
  expiresAt: number;
  timeFormatted: string;
}

const STORAGE_KEY = "pickup_password_reset_session";
const REGISTER_STORAGE_KEY = "pickup_register_session";

// Genera un código numérico aleatorio de 6 dígitos
export function generatePasscode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Calcula la hora límite de expiración (15 minutos)
export function calculateExpiration(minutesToAdd: number = 15) {
  const expiresDate = new Date(Date.now() + minutesToAdd * 60 * 1000);
  const hours = expiresDate.getHours().toString().padStart(2, "0");
  const minutes = expiresDate.getMinutes().toString().padStart(2, "0");
  const timeFormatted = `${hours}:${minutes} hs`;

  return {
    expiresAt: expiresDate.getTime(),
    timeFormatted,
  };
}

// Enviar correo con EmailJS
export async function sendResetCodeEmail(
  email: string,
  passcode: string,
  timeFormatted: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const payload = {
      service_id: EMAILJS_CONFIG.SERVICE_ID,
      template_id: EMAILJS_CONFIG.TEMPLATE_ID,
      user_id: EMAILJS_CONFIG.PUBLIC_KEY,
      template_params: {
        passcode,
        time: timeFormatted,
        email: email.trim(),
        to_email: email.trim(),
        to_name: email.split("@")[0],
      },
    };

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return { success: true };
    }

    const errorText = await response.text();
    return {
      success: false,
      error: errorText || `Error al enviar el correo (código ${response.status})`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Error al conectar con EmailJS",
    };
  }
}

// Guardar datos en sessionStorage
export function saveResetSession(data: ResetSessionData): void {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Obtener datos guardados
export function getResetSession(): ResetSessionData | null {
  const data = sessionStorage.getItem(STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Marcar como código verificado
export function markResetSessionVerified(): void {
  const session = getResetSession();
  if (session) {
    session.verified = true;
    saveResetSession(session);
  }
}

// Limpiar sesión
export function clearResetSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

// Enviar correo de confirmación de registro con EmailJS (template_4954e4b)
export async function sendRegisterCodeEmail(
  email: string,
  nombre: string,
  apellido: string,
  passcode: string,
  timeFormatted: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const fullName = `${nombre} ${apellido}`.trim();
    const payload = {
      service_id: EMAILJS_CONFIG.SERVICE_ID,
      template_id: EMAILJS_CONFIG.TEMPLATE_ID_REGISTER,
      user_id: EMAILJS_CONFIG.PUBLIC_KEY,
      template_params: {
        passcode,
        code: passcode,
        codigo: passcode,
        pin: passcode,
        time: timeFormatted,
        expiration_time: timeFormatted,
        email: email.trim(),
        to_email: email.trim(),
        to_name: fullName || email.split("@")[0],
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        name: nombre.trim(),
        user_name: fullName || email.split("@")[0],
      },
    };

    const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      return { success: true };
    }

    const errorText = await response.text();
    return {
      success: false,
      error: errorText || `Error al enviar el correo (código ${response.status})`,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Error al conectar con EmailJS",
    };
  }
}

// Guardar datos de registro pendiente en sessionStorage
export function saveRegisterSession(data: RegisterSessionData): void {
  sessionStorage.setItem(REGISTER_STORAGE_KEY, JSON.stringify(data));
}

// Obtener datos de registro pendiente
export function getRegisterSession(): RegisterSessionData | null {
  const data = sessionStorage.getItem(REGISTER_STORAGE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Limpiar sesión de registro pendiente
export function clearRegisterSession(): void {
  sessionStorage.removeItem(REGISTER_STORAGE_KEY);
}
