const AUTH_KEY = 'team_plus_admin_auth';

export function setAuthToken(token) {
  localStorage.setItem(AUTH_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated() {
  return Boolean(localStorage.getItem(AUTH_KEY));
}
