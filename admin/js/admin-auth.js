import { clearSession, getStoredSession, isSupabaseConfigured, saveSession, supabaseRequest } from "./supabase-client.js?v=31";

export const ADMIN_AUTH_CONFIGURED = isSupabaseConfigured();

export class AdminAuthError extends Error {
  constructor(code, message) {
    super(message);
    this.name = "AdminAuthError";
    this.code = code;
  }
}

let currentAdmin = null;

function asAdminError(error) {
  if (error instanceof AdminAuthError) return error;
  if (error && error.code === "NOT_CONFIGURED") {
    return new AdminAuthError("AUTH_NOT_CONFIGURED", "Admin sign-in is not configured. Contact the site administrator.");
  }
  return new AdminAuthError("AUTH_FAILED", error && error.message ? error.message : "Admin sign-in could not be completed.");
}

async function getVerifiedAdmin(session) {
  const user = await supabaseRequest("auth/v1/user", { session: session });
  if (!user || !user.id) throw new AdminAuthError("INVALID_SESSION", "Your sign-in has expired. Please sign in again.");
  const membership = await supabaseRequest(
    "rest/v1/admin_users?select=user_id&user_id=eq." + encodeURIComponent(user.id) + "&limit=1",
    { session: session }
  );
  if (!Array.isArray(membership) || membership.length !== 1) {
    clearSession();
    throw new AdminAuthError("ADMIN_REQUIRED", "This account is not on the approved administrator list.");
  }
  return { id: user.id, email: user.email || "", role: "admin" };
}

export async function loginAdmin(email, password) {
  const address = typeof email === "string" ? email.trim() : "";
  if (!address || !password) {
    throw new AdminAuthError("VALIDATION", "Enter an email address and password.");
  }
  if (!ADMIN_AUTH_CONFIGURED) {
    throw new AdminAuthError("AUTH_NOT_CONFIGURED", "Admin sign-in is not configured. Contact the site administrator.");
  }

  try {
    const session = await supabaseRequest("auth/v1/token?grant_type=password", {
      method: "POST",
      body: { email: address, password: password },
      publicOnly: true
    });
    saveSession(session);
    currentAdmin = await getVerifiedAdmin(session);
    return currentAdmin;
  } catch (error) {
    currentAdmin = null;
    if (error instanceof AdminAuthError) throw error;
    if (error && error.status === 400 && /invalid login credentials/i.test(error.message || "")) {
      throw new AdminAuthError("INVALID_CREDENTIALS", "Email or password is incorrect.");
    }
    throw asAdminError(error);
  }
}

export async function logoutAdmin() {
  const session = getStoredSession();
  currentAdmin = null;
  try {
    if (session) {
      await supabaseRequest("auth/v1/logout", {
        method: "POST",
        session: session,
        noRefresh: true
      });
    }
  } catch (error) {
    // Always clear this device's session even if the network is unavailable.
  } finally {
    clearSession();
  }
  return true;
}

export function getCurrentAdmin() {
  return currentAdmin;
}

export function isAdminAuthenticated() {
  return Boolean(currentAdmin && currentAdmin.id);
}

export async function requireAdmin() {
  if (currentAdmin && currentAdmin.id) return currentAdmin;
  const result = await initializeAdminAuth();
  if (!result.authenticated) {
    throw new AdminAuthError("ADMIN_REQUIRED", "A verified admin session is required.");
  }
  return result.admin;
}

export async function initializeAdminAuth() {
  if (!ADMIN_AUTH_CONFIGURED) {
    currentAdmin = null;
    return { configured: false, authenticated: false, admin: null };
  }
  const session = getStoredSession();
  if (!session) {
    currentAdmin = null;
    return { configured: true, authenticated: false, admin: null };
  }
  try {
    currentAdmin = await getVerifiedAdmin(session);
    return { configured: true, authenticated: true, admin: currentAdmin };
  } catch (error) {
    currentAdmin = null;
    if (error && error.code !== "ADMIN_REQUIRED") clearSession();
    return { configured: true, authenticated: false, admin: null, error: asAdminError(error) };
  }
}
