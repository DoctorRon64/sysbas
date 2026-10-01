# Vite + TypeScript + OSC starter

This project gives you:

- Vite development server on http://localhost:8001
- automatic browser refresh/HMR when project files change
- multiple project folders
- every project can contain `index.html` + `main.ts`
- browser <-> WebSocket bridge at `ws://localhost:8001/osc`
- real OSC/UDP server on `127.0.0.1:9000`

## Requirements

Use a current Node.js version supported by Vite. The current Vite documentation requires Node.js 20.19+ or 22.12+.

## Start

```bash
npm install
npm run dev
```

Then open:

- http://localhost:8001/ for the project list
- http://localhost:8001/example_client/
- http://localhost:8001/example_server/

The client sends `/x` and `/y` through the browser WebSocket bridge to UDP OSC port 9000.
The server receives those OSC messages and displays the values.

## Creating another project

Create:

```text
my_project/
  index.html
  main.ts
```

Then visit:

```text
http://localhost:8001/my_project/
```

No extra Vite configuration is needed.

## Ports

- `8001`: Vite + project pages + WebSocket OSC bridge
- `9000`: OSC over UDP

You can override the ports:

```bash
HTTP_PORT=8001 OSC_PORT=9000 npm run dev
```

On Windows PowerShell:

```powershell
$env:HTTP_PORT="8001"; $env:OSC_PORT="9000"; npm run dev
```

## Architecture

```text
Browser project
    |
    | WebSocket JSON
    v
Vite /osc bridge :8001
    |
    | OSC UDP
    v
OSC Server :9000
    |
    +--> SuperCollider / Max / TouchDesigner / other OSC software
```

The browser cannot directly open a UDP socket, so the WebSocket bridge is the browser-facing part.
