import { useCallback, useEffect, useState } from "react";
import { fetchTodo, updateTodo, deleteTodo } from "../../api/todos.js";
import { formatDate, priorityClass, isOverdue } from "../../utils.js";

function getTodoIdFromQuery() {
  return new URLSearchParams(window.location.search).get("id");
}

export default function TodoDetailPage() {
  const todoId = getTodoIdFromQuery();
  const [todo, setTodo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    dueDate: "",
    completed: false,
  });

  const loadTodo = useCallback(async () => {
    if (!todoId) {
      setError("Missing todo id in URL. Use ?id=<todo-id>");
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const data = await fetchTodo(todoId);
      setTodo(data);
      setForm({
        title: data.title,
        description: data.description,
        priority: data.priority,
        dueDate: data.dueDate ? data.dueDate.slice(0, 10) : "",
        completed: data.completed,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [todoId]);

  useEffect(() => {
    loadTodo();
  }, [loadTodo]);

  async function handleSave(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    try {
      setError(null);
      const updated = await updateTodo(todoId, {
        title: form.title,
        description: form.description,
        priority: form.priority,
        dueDate: form.dueDate || null,
        completed: form.completed,
      });
      setTodo(updated);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this todo permanently?")) return;
    try {
      setError(null);
      await deleteTodo(todoId);
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <p className="empty-state">Loading...</p>;
  }

  if (!todo && error) {
    return (
      <>
        <div className="header-actions">
          <h1>Todo not found</h1>
          <a href="/" className="btn btn-secondary">
            Back to list
          </a>
        </div>
        <div className="error">{error}</div>
      </>
    );
  }

  return (
    <>
      <div className="header-actions">
        <div>
          <h1>Todo detail</h1>
          <p className="subtitle" style={{ marginBottom: 0 }}>
            ID: {todo.id}
          </p>
        </div>
        <a href="/" className="btn btn-secondary">
          Back to list
        </a>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card">
        {editing ? (
          <form onSubmit={handleSave}>
            <div className="form-row">
              <label htmlFor="title">Title *</label>
              <input
                id="title"
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>
            <div className="form-row">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
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
            <div className="form-row">
              <label>
                <input
                  type="checkbox"
                  checked={form.completed}
                  onChange={(e) => setForm({ ...form, completed: e.target.checked })}
                />{" "}
                Mark as completed
              </label>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="submit" className="btn btn-primary">
                Save changes
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setEditing(false);
                  setForm({
                    title: todo.title,
                    description: todo.description,
                    priority: todo.priority,
                    dueDate: todo.dueDate ? todo.dueDate.slice(0, 10) : "",
                    completed: todo.completed,
                  });
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="detail-grid">
            <div className="detail-row">
              <span className="detail-label">Title</span>
              <span className="detail-value">{todo.title}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Description</span>
              <span className="detail-value">
                {todo.description || "—"}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span className="detail-value">
                <span className={`badge ${todo.completed ? "badge-done" : "badge-pending"}`}>
                  {todo.completed ? "Completed" : "Pending"}
                </span>
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Priority</span>
              <span className={`detail-value ${priorityClass(todo.priority)}`}>
                {todo.priority}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Due date</span>
              <span
                className={`detail-value ${
                  isOverdue(todo.dueDate, todo.completed) ? "overdue" : ""
                }`}
              >
                {todo.dueDate ? formatDate(todo.dueDate) : "—"}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Created</span>
              <span className="detail-value">{formatDate(todo.createdAt)}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Last updated</span>
              <span className="detail-value">{formatDate(todo.updatedAt)}</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
              <button type="button" className="btn btn-primary" onClick={() => setEditing(true)}>
                Edit
              </button>
              <button type="button" className="btn btn-danger" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
