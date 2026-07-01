import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import TodoDetailPage from "./TodoDetailPage.jsx";
import "../../styles.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TodoDetailPage />
  </StrictMode>
);
