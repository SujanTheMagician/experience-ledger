const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function handleResponse(res) {
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.message || `Request failed with status ${res.status}`);
  }
  return body;
}

export async function registerUser({ name, email, password, role }) {
  const res = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password, role }),
  });
  return handleResponse(res);
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(res);
}
