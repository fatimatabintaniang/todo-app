import { useEffect, useState } from "react";
import { api } from "./api.js";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .list()
      .then(setTodos)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function addTodo(e) {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    try {
      const created = await api.create(trimmed);
      setTodos((prev) => [...prev, created]);
      setTitle("");
    } catch (e) {
      setError(e.message);
    }
  }

  async function toggleDone(todo) {
    try {
      const updated = await api.update(todo.id, { done: !todo.done });
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    } catch (e) {
      setError(e.message);
    }
  }

  async function removeTodo(id) {
    try {
      await api.remove(id);
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (e) {
      setError(e.message);
    }
  }

  const remaining = todos.filter((t) => !t.done).length;

  return (
    <div className="page">
      <main className="ledger">
        <header className="ledger-head">
          <span className="eyebrow">Registre du jour</span>
          <h1>Mes tâches</h1>
        </header>

        <form className="add-row" onSubmit={addTodo}>
          <input
            type="text"
            placeholder="Ajouter une tâche…"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button type="submit" aria-label="Ajouter">
            Ajouter
          </button>
        </form>

        {error && <p className="error">{error}</p>}

        {loading ? (
          <p className="hint">Chargement…</p>
        ) : todos.length === 0 ? (
          <p className="hint">Rien à faire. Ajoute ta première tâche ci-dessus.</p>
        ) : (
          <ul className="list">
            {todos.map((todo) => (
              <li key={todo.id} className={todo.done ? "done" : ""}>
                <button
                  className="check"
                  onClick={() => toggleDone(todo)}
                  aria-label={todo.done ? "Marquer comme à faire" : "Marquer comme fait"}
                >
                  {todo.done && (
                    <svg viewBox="0 0 16 16" width="10" height="10">
                      <path
                        d="M2 8.5 L6 12 L14 3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </button>
                <span className="title">{todo.title}</span>
                <button
                  className="remove"
                  onClick={() => removeTodo(todo.id)}
                  aria-label="Supprimer"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}

        <footer className="ledger-foot">
          {todos.length > 0 && (
            <span>
              {remaining} restante{remaining !== 1 ? "s" : ""} sur {todos.length}
            </span>
          )}
        </footer>
      </main>
    </div>
  );
}
