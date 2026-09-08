import { createServer as createViteServer } from "vite";
import app from "./api/index.js";

async function startServer() {
  console.log("Starting local development server...");
  const args = process.argv.slice(2);
  const portIndex = args.indexOf('--port');
  const PORT = portIndex >= 0 ? Number(args[portIndex + 1]) : 3000;
  const hostIndex = args.indexOf('--host');
  const HOST = hostIndex >= 0 ? args[hostIndex + 1] : '0.0.0.0';

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: HOST, port: PORT, strictPort: args.includes("--strictPort"), allowedHosts: ["terminal.local"] },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
