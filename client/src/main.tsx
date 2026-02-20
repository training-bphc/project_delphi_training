import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "../src/App";
import React from "react";
import ReactDOM from "react-dom/client";

document.body.style.margin = "0";
document.body.style.padding = "0";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
