// Thin fetch wrapper around the /api/experiences backend (see server/routes/experienceRoutes.js).

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

export async function fetchExperiences(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE_URL}/api/experiences${query ? `?${query}` : ''}`);
  const body = await handleResponse(res);
  return body.data;
}

export async function createExperience(payload) {
  const res = await fetch(`${BASE_URL}/api/experiences`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(payload),
  });
  const body = await handleResponse(res);
  return body.data;
}

export async function updateExperienceStatus(id, status, mentorComment) {
  const res = await fetch(`${BASE_URL}/api/experiences/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({ status, mentorComment }),
  });
  const body = await handleResponse(res);
  return body.data;
}

export async function deleteExperience(id) {
  const res = await fetch(`${BASE_URL}/api/experiences/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse(res);
}
