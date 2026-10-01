import type { Plugin } from "vite";

const LIFECYCLE = [
  "preload",
  "setup",
  "draw",
  "windowResized",
  "mousePressed",
  "mouseReleased",
  "mouseClicked",
  "mouseMoved",
  "mouseDragged",
  "mouseWheel",
  "doubleClicked",
  "keyPressed",
  "keyReleased",
  "keyTyped",
  "touchStarted",
  "touchMoved",
  "touchEnded",
  "deviceMoved",
  "deviceTurned",
  "deviceShaken",
] as const;

function isProjectMain(id: string) {
  if (id.includes("node_modules")) return false;
  if (/[\\/](server|shared)[\\/]/.test(id)) return false;
  return /[\\/][^\\/]+[\\/]main\.tsx?$/.test(id);
}

function looksLikeGlobalP5(code: string) {
  if (/new\s+p5\s*\(/.test(code)) return false;

  const hasLifecycle =
    /\bfunction\s+(setup|draw|preload)\b/.test(code) ||
    /\b(?:const|let|var)\s+(setup|draw|preload)\s*=/.test(code);

  if (!hasLifecycle) return false;

  return (
    /\bcreateCanvas\b/.test(code) ||
    /from\s+["']p5(?:\/global)?["']/.test(code) ||
    /import\s+["']p5(?:\/global)?["']/.test(code)
  );
}

function findLifecycleFns(code: string) {
  return LIFECYCLE.filter((name) =>
    new RegExp(
      String.raw`(?:function\s+${name}\b|(?:const|let|var)\s+${name}\s*=)`
    ).test(code)
  );
}

/**
 * Lets project main.ts files use classic p5 global syntax:
 *
 *   function setup() { createCanvas(800, 600); }
 *   function draw() { background(220); }
 */
export function p5GlobalPlugin(): Plugin {
  return {
    name: "p5-global",
    enforce: "pre",
    transform(code, id) {
      if (!isProjectMain(id) || !looksLikeGlobalP5(code)) return;

      const found = findLifecycleFns(code);
      if (found.length === 0) return;

      let next = code
        .replace(/import\s+p5\s+from\s+["']p5["']\s*;?\s*/g, "")
        .replace(/import\s+["']p5(?:\/global)?["']\s*;?\s*/g, "")
        .replace(/import\s+\*\s+as\s+p5\s+from\s+["']p5["']\s*;?\s*/g, "");

      const register = found
        .map((name) => `(globalThis as any).${name} = ${name};`)
        .join("\n");

      next = `import p5 from "../shared/p5-sound";\n${next}\n\n${register}\n(globalThis as any).__p5?.remove?.();\n(globalThis as any).__p5 = new p5();\n`;

      return {
        code: next,
        map: null,
      };
    },
  };
}
