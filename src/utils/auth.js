export function getToken() {
    return localStorage.getItem("token") || null;
  }
  
  export function getRole() {
    const t = getToken();
    if (!t) return null;
    try {
      const payload = JSON.parse(atob(t.split(".")[1] || ""));
      return payload.rol || null; // el backend firma { id, rol }
    } catch {
      return null;
    }
  }
  
  export function isAllowed(roles = []) {
    const r = getRole();
    return !!r && (roles.length === 0 || roles.includes(r));
  }
  