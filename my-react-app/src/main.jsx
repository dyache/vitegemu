import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <div className="min-h-screen w-full bg-gradient-to-b from-black via-purple-950 to-black text-white">
      <App />
    </div>
  </React.StrictMode>,
);
