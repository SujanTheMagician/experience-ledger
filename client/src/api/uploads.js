// Thin fetch wrapper around the /api/uploads backend (see server/routes/uploadRoutes.js).

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('el_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function uploadEvidenceFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${BASE_URL}/api/uploads`, {
    method: 'POST',
    headers: authHeaders(), // no Content-Type - the browser sets the multipart boundary itself
    body: formData,
  });

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.message || `Upload failed with status ${res.status}`);
  }
  return body.data;
}

export function resolveFileUrl(path) {
  if (!path) return path;
  return path.startsWith('http') ? path : `${BASE_URL}${path}`;
}
