import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_FILE = join(__dirname, "..", "data", "todos.json");

function loadTodos() {
  if (!existsSync(DATA_FILE)) {
    return [];
  }
  return JSON.parse(readFileSync(DATA_FILE, "utf-8"));
}

function saveTodos(todos) {
  writeFileSync(DATA_FILE, JSON.stringify(todos, null, 2));
}

export function getAllTodos() {
  return loadTodos();
}

export function getTodoById(id) {
  return loadTodos().find((t) => t.id === id) ?? null;
}

export function createTodo({ title, description = "", priority = "medium", dueDate = null }) {
  const now = new Date().toISOString();
  const todo = {
    id: uuidv4(),
    title: title.trim(),
    description: description.trim(),
    completed: false,
    priority,
    dueDate,
    createdAt: now,
    updatedAt: now,
  };
  const todos = loadTodos();
  todos.push(todo);
  saveTodos(todos);
  return todo;
}

export function updateTodo(id, updates) {
  const todos = loadTodos();
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return null;

  const allowed = ["title", "description", "completed", "priority", "dueDate"];
  const todo = { ...todos[index] };
  for (const key of allowed) {
    if (key in updates) {
      todo[key] = updates[key];
    }
  }
  if ("title" in updates) todo.title = updates.title.trim();
  if ("description" in updates) todo.description = updates.description.trim();
  todo.updatedAt = new Date().toISOString();

  todos[index] = todo;
  saveTodos(todos);
  return todo;
}

export function deleteTodo(id) {
  const todos = loadTodos();
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) return false;
  todos.splice(index, 1);
  saveTodos(todos);
  return true;
}
