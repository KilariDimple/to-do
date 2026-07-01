import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../../api/todos.js";
import { formatDate, priorityClass, isOverdue } from "../../utils.js";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

export default function TodoListPage() {
  const [todos, setTodos] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
  });

  const loadTodos = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchTodos();
      setTodos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const filtered = useMemo(() => {
    if (filter === "active") return todos.filter((t) => !t.completed);
    if (filter === "completed") return todos.filter((t) => t.completed);
    return todos;
  }, [todos, filter]);

  const activeCount = todos.filter((t) => !t.completed).length;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      setError(null);
      await createTodo({
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: form.dueDate || null,
      });
      setForm({ title: "", description: "", priority: "medium", dueDate: "" });
      await loadTodos();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggleComplete(todo) {
    try {
      setError(null);
      await updateTodo(todo.id, { completed: !todo.completed });
      await loadTodos();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("Delete this todo?")) return;
    try {
      setError(null);
      await deleteTodo(id);
      await loadTodos();
    } catch (err) {
      setError(err.message);
    }
  }

  async function clearCompleted() {
    const completed = todos.filter((t) => t.completed);
    if (completed.length === 0) return;
    if (!confirm(`Delete ${completed.length} completed todo(s)?`)) return;
    try {
      setError(null);
      await Promise.all(completed.map((t) => deleteTodo(t.id)));
      await loadTodos();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <h1>Todos</h1>
      <p className="subtitle">Manage your tasks — add, complete, filter, and organize.</p>

      {error && <div className="error">{error}</div>}

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <label htmlFor="title">Title *</label>
            <input
              id="title"
              type="text"
              placeholder="What needs to be done?"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>
          <div className="form-row">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Add details..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="form-row">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="form-row">
            <label htmlFor="dueDate">Due date</label>
            <input
              id="dueDate"
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Add todo
          </button>
        </form>
      </div>

      <div className="stats">
        {activeCount} active · {todos.length - activeCount} completed
        {todos.some((t) => t.completed) && (
          <>
            {" · "}
            <button type="button" className="btn btn-sm btn-secondary" onClick={clearCompleted}>
              Clear completed
            </button>
          </>
        )}
      </div>

      <div className="filters">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`filter-btn ${filter === key ? "active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? (
          <p className="empty-state">Loading...</p>
        ) : filtered.length === 0 ? (
          <p className="empty-state">
            {filter === "all" ? "No todos yet. Add one above!" : `No ${filter} todos.`}
          </p>
        ) : (
          filtered.map((todo) => (
            <div
              key={todo.id}
              className={`todo-item ${todo.completed ? "completed" : ""}`}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleComplete(todo)}
                aria-label={`Mark "${todo.title}" as ${todo.completed ? "incomplete" : "complete"}`}
              />
              <div className="todo-body">
                <p className="todo-title">{todo.title}</p>
                {todo.description && (
                  <p style={{ margin: "0 0 0.25rem", fontSize: "0.9rem", color: "var(--muted)" }}>
                    {todo.description}
                  </p>
                )}
                <div className="todo-meta">
                  <span className={priorityClass(todo.priority)}>
                    {todo.priority} priority
                  </span>
                  {todo.dueDate && (
                    <span className={isOverdue(todo.dueDate, todo.completed) ? "overdue" : ""}>
                      Due {formatDate(todo.dueDate)}
                    </span>
                  )}
                  <span>Created {formatDate(todo.createdAt)}</span>
                </div>
              </div>
              <div className="todo-actions">
                <a href={`/todo.html?id=${todo.id}`} className="btn btn-sm btn-secondary">
                  View
                </a>
                <button
                  type="button"
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(todo.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
