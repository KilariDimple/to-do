const API_BASE = "/api/todos";

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function fetchTodos() {
  return request(API_BASE);
}

export function fetchTodo(id) {
  return request(`${API_BASE}/${id}`);
}

export function createTodo(data) {
  return request(API_BASE, { method: "POST", body: JSON.stringify(data) });
}

export function updateTodo(id, data) {
  return request(`${API_BASE}/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteTodo(id) {
  return request(`${API_BASE}/${id}`, { method: "DELETE" });
}
