/**
 * Frontend-only mock auth layer, backed by localStorage.
 * There is no backend yet — swap these for real API calls once one exists.
 * NOTE: passwords are stored in plaintext in localStorage. This is fine for a
 * local/demo mock, but must NOT be treated as production-grade auth.
 */

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface StoredAccount extends AuthUser {
  password: string;
}

const ACCOUNTS_KEY = "reviewguard.accounts";
const SESSION_KEY = "reviewguard.session";

function readAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function setSession(user: AuthUser | null) {
  if (typeof window === "undefined") return;
  if (!user) {
    window.localStorage.removeItem(SESSION_KEY);
    return;
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function getSession(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function signUp(input: { name: string; email: string; password: string }): AuthUser {
  const accounts = readAccounts();
  const email = input.email.trim().toLowerCase();

  if (accounts.some((a) => a.email === email)) {
    throw new Error("An account with this email already exists.");
  }

  const account: StoredAccount = {
    id: crypto.randomUUID(),
    name: input.name.trim(),
    email,
    password: input.password,
  };

  accounts.push(account);
  writeAccounts(accounts);

  const user: AuthUser = { id: account.id, name: account.name, email: account.email };
  setSession(user);
  return user;
}

export function signIn(input: { email: string; password: string }): AuthUser {
  const accounts = readAccounts();
  const email = input.email.trim().toLowerCase();
  const account = accounts.find((a) => a.email === email);

  if (!account || account.password !== input.password) {
    throw new Error("Invalid email or password.");
  }

  const user: AuthUser = { id: account.id, name: account.name, email: account.email };
  setSession(user);
  return user;
}

export function signOut() {
  setSession(null);
}
