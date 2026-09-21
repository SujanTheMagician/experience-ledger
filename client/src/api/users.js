// Thin fetch wrapper around the /api/users backend (see server/routes/userRoutes.js). Admin-only.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('el_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.message || `Request failed with status ${res.status}`);
  }
  return body;
}

export async function fetchUsers() {
  const res = await fetch(`${BASE_URL}/api/users`, { headers: authHeaders() });
  const body = await handleResponse(res);
  return body.data;
}

export async function updateUserRole(id, role) {
  const res = await fetch(`${BASE_URL}/api/users/${id}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ role }),
  });
  const body = await handleResponse(res);
  return body.data;
}
