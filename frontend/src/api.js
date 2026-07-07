const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `Erreur ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  list: () => fetch(`${API_URL}/todos`).then(handle),

  create: (title) =>
    fetch(`${API_URL}/todos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    }).then(handle),

  update: (id, patch) =>
    fetch(`${API_URL}/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    }).then(handle),

  remove: (id) =>
    fetch(`${API_URL}/todos/${id}`, { method: "DELETE" }).then(handle),
};
