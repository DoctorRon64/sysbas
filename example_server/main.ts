import { OscBrowserClient } from "../shared/osc";

const canvas = document.createElement("canvas");
canvas.width = 640;
canvas.height = 480;
document.body.appendChild(canvas);

const ctx = canvas.getContext("2d")!;

let x = 100;
let y = 100;

const osc = new OscBrowserClient();

osc.onMessage(({ address, args }) => {
  const value = Number(args[0]);

  if (!Number.isFinite(value)) return;

  if (address === "/x") {
    x = value;
  } else if (address === "/y") {
    y = value;
  }

  draw();
});

osc.connect()
  .then(() => console.log("Connected to OSC bridge"))
  .catch(console.error);

function draw() {
  ctx.fillStyle = "#3200dc";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(x, y, 12, 0, Math.PI * 2);
  ctx.fill();
}

draw();
