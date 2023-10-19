import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { Route, Routes, Link } from "react-router-dom";
import Quiz from "./Quiz.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Link to="/quiz">View Quiz</Link>
      <br />
      <Link to="/">View Sandbox</Link>
      <Routes>
        <Route index element={<App />} />
        <Route path="/quiz" element={<Quiz />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
