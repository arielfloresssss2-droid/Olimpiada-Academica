/**
 * Configuración dinámica de la URL base para el backend (API).
 * 
 * - Si se define VITE_API_URL (por ejemplo en un archivo .env), se usará esa URL explícita.
 * - En desarrollo con Vite, usar '' (ruta relativa /api/...) aprovecha el proxy configurado en vite.config.ts.
 *   Esto permite que cualquier dispositivo en la red local (celular, otra PC) se conecte a través
 *   del puerto de Vite (5173), evitando bloqueos del Firewall de Windows en el puerto 5006 y sin problemas de CORS.
 * - En caso de que se ejecute una compilación estática o sin proxy, se conecta automáticamente
 *   usando el mismo hostname/IP del dispositivo que hostea en el puerto 5006.
 */

export const getApiBaseUrl = (): string => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (import.meta.env.DEV) {
    return '';
  }
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:5006`;
  }
  return 'http://localhost:5006';
};

export const API_BASE_URL = getApiBaseUrl();
