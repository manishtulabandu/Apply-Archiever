import { spawn } from "child_process";
import { exec } from "child_process";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

console.log("Starting Apply Archive application...");

// Start the backend server
const serverProcess = spawn("node", ["server.js"], {
  stdio: "inherit",
  env: process.env,
});

serverProcess.on("error", (err) => {
  console.error("Failed to start backend server:", err);
});

// Start the frontend with Vite
const viteProcess = spawn("npm", ["run", "dev"], {
  stdio: "inherit",
  env: process.env,
});

viteProcess.on("error", (err) => {
  console.error("Failed to start frontend server:", err);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down servers...");
  serverProcess.kill();
  viteProcess.kill();
  process.exit();
});

console.log("\nApply Archive servers started successfully!");
console.log("- Backend running on: http://localhost:5001");
console.log("- Frontend running on: http://localhost:8080");
console.log("\nPress Ctrl+C to stop both servers.\n");
