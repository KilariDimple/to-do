import { Router } from "express";
import {
  getAllTodos,
  getTodoById,
  createTodo,
  updateTodo,
  deleteTodo,
} from "../store.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json(getAllTodos());
});

router.get("/:id", (req, res) => {
  const todo = getTodoById(req.params.id);
  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.json(todo);
});

router.post("/", (req, res) => {
  const { title, description, priority, dueDate } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Title is required" });
  }
  const todo = createTodo({ title, description, priority, dueDate });
  res.status(201).json(todo);
});

router.put("/:id", (req, res) => {
  const todo = updateTodo(req.params.id, req.body);
  if (!todo) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.json(todo);
});

router.delete("/:id", (req, res) => {
  const deleted = deleteTodo(req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: "Todo not found" });
  }
  res.status(204).send();
});

export default router;
