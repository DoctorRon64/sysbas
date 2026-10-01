import http from "node:http";
import path from "node:path";
import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";

import { createServer } from "vite";
import { WebSocketServer, WebSocket } from "ws";
import { Client as OscClient, Server as OscServer } from "node-osc";

import { p5GlobalPlugin } from "./vite-plugin-p5-global";

const __filename = fileURLToPath(import.meta.url);
const ROOT = path.resolve(path.dirname(__filename), "..");

const HTTP_PORT = Number(process.env.HTTP_PORT ?? 8001);
const OSC_PORT = Number(process.env.OSC_PORT ?? 9000);
const OSC_HOST = process.env.OSC_HOST ?? "127.0.0.1";

type BrowserOscMessage = {
  address: string;
  args: unknown[];
};

function isBrowserOscMessage(value: unknown): value is BrowserOscMessage {
  if (!value || typeof value !== "object") return false;
  const message = value as Record<string, unknown>;
  return typeof message.address === "string" && Array.isArray(message.args);
}

function normalizeOscMessage(message: any): BrowserOscMessage | null {
  if (!message || typeof message.address !== "string") return null;

  const args = Array.isArray(message.args)
    ? message.args.map((arg: any) => {
        if (
          arg &&
          typeof arg === "object" &&
          Object.prototype.hasOwnProperty.call(arg, "value")
        ) {
          return arg.value;
        }
        return arg;
      })
    : [];

  return {
    address: message.address,
    args,
  };
}

async function findProjects() {
  const entries = await fs.readdir(ROOT, { withFileTypes: true });

  const projects: string[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (entry.name.startsWith(".")) continue;
    if (["node_modules", "dist", "server", "shared"].includes(entry.name)) continue;

    const folder = path.join(ROOT, entry.name);

    try {
      await fs.access(path.join(folder, "index.html"));
      await fs.access(path.join(folder, "main.ts"));
      projects.push(entry.name);
    } catch {
      // Not a project folder.
    }
  }

  return projects.sort();
}

function sendHtml(res: http.ServerResponse, html: string) {
  res.statusCode = 200;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.end(html);
}

async function main() {
  const httpServer = http.createServer();

  const vite = await createServer({
    root: ROOT,
    appType: "custom",
    plugins: [p5GlobalPlugin()],
    optimizeDeps: {
      include: ["p5", "p5.sound/dist/p5.sound.min.js"],
    },
    server: {
      middlewareMode: true,
      hmr: {
        server: httpServer,
      },
    },
  });

  // The browser-facing OSC WebSocket endpoint. `noServer` is required: with
  // `server` + `path`, ws aborts every other upgrade, including Vite's HMR socket.
  const webSocketServer = new WebSocketServer({ noServer: true });

  httpServer.on("upgrade", (req, socket, head) => {
    const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
    if (pathname !== "/osc") return;

    webSocketServer.handleUpgrade(req, socket, head, (ws) => {
      webSocketServer.emit("connection", ws, req);
    });
  });

  // Real UDP OSC server.
  const oscServer = new OscServer(OSC_PORT, OSC_HOST, () => {
    console.log(`OSC UDP server listening on ${OSC_HOST}:${OSC_PORT}`);
  });

  // Used when a browser sends OSC -> UDP.
  const udpClient = new OscClient(OSC_HOST, OSC_PORT);

  webSocketServer.on("connection", (socket) => {
    console.log("Browser OSC client connected.");

    socket.on("message", async (raw) => {
      try {
        const data: unknown = JSON.parse(raw.toString());

        if (!isBrowserOscMessage(data)) {
          console.warn("Ignoring invalid browser OSC message:", data);
          return;
        }

        await udpClient.send(data.address, ...data.args);
      } catch (error) {
        console.error("Browser OSC message error:", error);
      }
    });

    socket.on("close", () => {
      console.log("Browser OSC client disconnected.");
    });
  });

  // UDP OSC -> every connected browser project.
  oscServer.on("message", (message: any) => {
    const normalized = normalizeOscMessage(message);

    if (!normalized) return;

    console.log(`OSC ${normalized.address}`, normalized.args);

    const payload = JSON.stringify(normalized);

    for (const socket of webSocketServer.clients) {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(payload);
      }
    }
  });

  // Project directory at "/".
  httpServer.on("request", async (req, res) => {
    try {
      const url = new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`);
      const pathname = url.pathname;

      if (pathname === "/" || pathname === "/index.html") {
        const projects = await findProjects();

        const links = projects
          .map(
            (project) =>
              `<li><a href="/${encodeURIComponent(project)}/">${project}</a></li>`
          )
          .join("");

        sendHtml(
          res,
          `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>OSC + Vite projects</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 700px; margin: 40px auto; padding: 0 20px; }
    a { line-height: 2; }
    code { background: #eee; padding: 2px 5px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Projects</h1>
  <p>Each project contains <code>index.html</code> and <code>main.ts</code>.</p>
  <ul>${links || "<li>No projects found yet.</li>"}</ul>
  <p>OSC UDP: <code>${OSC_HOST}:${OSC_PORT}</code></p>
</body>
</html>`
        );

        return;
      }

      // Serve project index.html through Vite so HMR / transforms work.
      const projectMatch = pathname.match(/^\/([^/]+)\/(?:index\.html)?$/);
      if (projectMatch) {
        const project = decodeURIComponent(projectMatch[1]);
        const htmlPath = path.join(ROOT, project, "index.html");

        try {
          const template = await fs.readFile(htmlPath, "utf-8");
          const html = await vite.transformIndexHtml(`/${project}/`, template);
          sendHtml(res, html);
          return;
        } catch {
          // Fall through to Vite middleware / 404.
        }
      }
    } catch (error) {
      console.error("Request error:", error);
      res.statusCode = 500;
      res.end("Internal server error");
      return;
    }

    vite.middlewares(req, res, () => {
      if (!res.headersSent) {
        res.statusCode = 404;
        res.end("Not found");
      }
    });
  });

  await new Promise<void>((resolve, reject) => {
    httpServer.once("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        reject(
          new Error(
            `Poort ${HTTP_PORT} is al in gebruik. Stop het andere proces (Ctrl+C in die terminal) of kies een andere poort: HTTP_PORT=8002 npm run dev`
          )
        );
        return;
      }
      reject(error);
    });

    httpServer.listen(HTTP_PORT, "127.0.0.1", () => resolve());
  });

  console.log("");
  console.log(`Vite:      http://localhost:${HTTP_PORT}/`);
  console.log(`OSC UDP:   ${OSC_HOST}:${OSC_PORT}`);
  console.log(`OSC WS:    ws://localhost:${HTTP_PORT}/osc`);
  console.log("");
  console.log("Press Ctrl+C to stop.");

  const shutdown = async () => {
    console.log("\nStopping...");
    await vite.close();
    await oscServer.close();
    await udpClient.close();
    webSocketServer.close();
    httpServer.close();
  };

  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
