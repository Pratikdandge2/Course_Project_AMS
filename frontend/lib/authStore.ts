export type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  role: "ALUMNI" | "ADMIN" | null;
};

const KEY = "ams_auth";
const REG_KEY = "ams_reg";

export function loadAuth(): AuthState {
  if (typeof window === "undefined") return { accessToken: null, refreshToken: null, role: null };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { accessToken: null, refreshToken: null, role: null };
    const parsed = JSON.parse(raw) as AuthState;
    return {
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
      role: parsed.role ?? null
    };
  } catch {
    return { accessToken: null, refreshToken: null, role: null };
  }
}

export function saveAuth(state: AuthState) {
  window.localStorage.setItem(KEY, JSON.stringify(state));
}

export function clearAuth() {
  window.localStorage.removeItem(KEY);
}

export type RegistrationState = {
  email: string | null;
  regToken: string | null;
};

export function loadRegistration(): RegistrationState {
  if (typeof window === "undefined") return { email: null, regToken: null };
  try {
    const raw = window.localStorage.getItem(REG_KEY);
    if (!raw) return { email: null, regToken: null };
    const parsed = JSON.parse(raw) as RegistrationState;
    return { email: parsed.email ?? null, regToken: parsed.regToken ?? null };
  } catch {
    return { email: null, regToken: null };
  }
}

export function saveRegistration(state: RegistrationState) {
  window.localStorage.setItem(REG_KEY, JSON.stringify(state));
}

export function clearRegistration() {
  window.localStorage.removeItem(REG_KEY);
}

