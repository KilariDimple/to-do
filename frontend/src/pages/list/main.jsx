import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import TodoListPage from "./TodoListPage.jsx";
import "../../styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TodoListPage />
  </StrictMode>
);
