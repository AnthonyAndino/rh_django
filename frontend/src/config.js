// API base URL — reads from env or falls back to a default path.
export const urlBase =
  import.meta.env.VITE_API_BASE_URL || '/api/empleados'
