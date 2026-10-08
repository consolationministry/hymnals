// Phase 2A authentication boundary. No credentials are sent, checked, or persisted here.
// Replace this adapter with Supabase Auth plus server/database admin authorization in a later phase.
export const ADMIN_AUTH_CONFIGURED = false;

export class AdminAuthError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "AdminAuthError";
    this.code = code;
  }
}

export async function loginAdmin(email, password) {
  if (!email || !password) {
    throw new AdminAuthError("VALIDATION", "Enter an email address and password.");
  }
  // Deliberately fail closed until a real authentication provider is configured.
  throw new AdminAuthError("AUTH_NOT_CONFIGURED", "Admin sign-in is not configured yet. No credentials were sent or stored.");
}

export async function logoutAdmin() {
  // There is no session in this preview phase. Keep this method as the future provider boundary.
  return true;
}

export function getCurrentAdmin() {
  return null;
}

export function isAdminAuthenticated() {
  return false;
}

export async function requireAdmin() {
  throw new AdminAuthError("ADMIN_REQUIRED", "A verified admin session is required when authentication is configured.");
}

export async function initializeAdminAuth() {
  return { configured: ADMIN_AUTH_CONFIGURED, authenticated: false, admin: null };
}
