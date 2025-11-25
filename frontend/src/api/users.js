const USERS_BASE = "/users-api"; 
// Ojo: debe tener proxy en vite.config.js

export async function registerUser(data) {
  const res = await fetch(`${USERS_BASE}/v1/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error("Error al registrar usuario");

  return res.json();
}

export async function loginUser(credentials) {
  const res = await fetch(`${USERS_BASE}/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) throw new Error("Credenciales inválidas");

  return res.json();
}

export async function getProfile(token) {
  const res = await fetch(`${USERS_BASE}/v1/users/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("No autorizado");

  return res.json();
}

export async function updateProfile(token, payload) {
  const res = await fetch(`${USERS_BASE}/v1/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error("Error actualizando perfil:", txt);
    throw new Error("Error al actualizar perfil");
  }

  return res.json();
}
