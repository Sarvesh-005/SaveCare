/// <reference types="vite/client" />
const API_BASE = import.meta.env.VITE_API_BASE || '';

async function request(path: string, init: RequestInit = {}) {
  const headers: Record<string,string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string,string> || {}),
  };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, { ...init, headers });
  const text = await res.text();
  const contentType = res.headers.get('content-type') || '';

  if (!res.ok) {
    // try to parse JSON error
    try {
      const json = JSON.parse(text || '{}');
      throw new Error(json.message || text || res.statusText);
    } catch (e) {
      throw new Error(text || res.statusText);
    }
  }

  if (!text) return null;
  if (contentType.includes('application/json')) return JSON.parse(text);
  return text as any;
}

export { request, API_BASE };
