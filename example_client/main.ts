import { OscBrowserClient } from "../shared/osc";

const canvas = document.createElement("canvas");
canvas.width = 640;
canvas.height = 480;
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d")!;

const osc = new OscBrowserClient();

osc.connect()
  .then(() => console.log("Connected to OSC bridge"))
  .catch(console.error);

function draw(x: number, y: number) {
  ctx.fillStyle = "#dd0032";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();
}

function sendMouse(event: MouseEvent) {
  const rect = canvas.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  draw(x, y);

  osc.send("/x", x);
  osc.send("/y", y);
}

canvas.addEventListener("mousemove", sendMouse);

canvas.addEventListener("touchmove", (event) => {
  event.preventDefault();

  const touch = event.touches[0];
  if (!touch) return;

  const rect = canvas.getBoundingClientRect();
  const x = touch.clientX - rect.left;
  const y = touch.clientY - rect.top;

  draw(x, y);

  osc.send("/x", x);
  osc.send("/y", y);
}, { passive: false });

draw(100, 100);
