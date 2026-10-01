import { Ball, getRandomColor } from "./ball";

let bgcolor: string = '#3b3849';

let phase = 0;
let phaseSteps = 0.1;

const ball1 = new Ball(100, 100, 10, 10, 120, '#e70000', [72, 74, 76, 79, 81]);
const ball2 = new Ball(200, 200, 5, 5, 80, '#154e7a', [50, 52, 54, 57, 59]);
const ball3 = new Ball(700, 600, 5, 5, 80, '#154e7a', [60, 62, 64, 67, 69]);
const ball4 = new Ball(800, 200, 5, 5, 80, '#154e7a', [60, 62, 64, 67, 69]);

let mouseDragBall: Ball | null = null;
const balls: Ball[] = []
const activeCollisions = new Set();

function setup() {
  createCanvas(800, 600);

  balls.push(ball1);
  balls.push(ball2);
  balls.push(ball3);
  balls.push(ball4);
}

function draw() {
  background(bgcolor);

  for (let i = 0; i < balls.length; i++) {
    for (let j = i + 1; j < balls.length; j++) {
      const a = balls[i];
      const b = balls[j];
      const collisionKey = `${i}-${j}`;
      const colliding = a.collideBall(b);
      if (colliding) {
        if (!activeCollisions.has(collisionKey)) {
          a.xSpeed *= -1;
          a.ySpeed *= -1;
          b.xSpeed *= -1;
          b.ySpeed *= -1;
          a.gravitySpeed = 0;
          b.gravitySpeed = 0;
          a.playNote();
          b.playNote();
          stuiter(a);
          stuiter(b);
          activeCollisions.add(collisionKey);
        }
      } else {
        activeCollisions.delete(collisionKey);
      }
    }
    updateBall(balls[i]);
  }
}

//update the balls different functions
function updateBall(ball: Ball) {
  if (mouseDragBall !== ball) {
    clamp(ball);
    ball.move();
  }

  ball.checkCenter();
  ball.draw();
}

//clamp to the width and height of the screen
function clamp(ball: Ball) {
  // Horizontal walls
  if (ball.x + ball.size / 2 >= width || ball.x - ball.size / 2 <= 0) {
    ball.x = constrain(ball.x, ball.size / 2, width - ball.size / 2);
    ball.xSpeed = -ball.xSpeed;
    ball.playNote();
    stuiter(ball);
  }

  // Vertical walls
  if (ball.y + ball.size / 2 >= height || ball.y - ball.size / 2 <= 0) {
    ball.y = constrain(ball.y, ball.size / 2, height - ball.size / 2);
    ball.ySpeed = -ball.ySpeed;
    ball.gravitySpeed = 0;
    ball.playNote();
    stuiter(ball);
  }
}

function stuiter(ball: Ball) {
  ball.color = getRandomColor();
  bgcolor = randomRGBAColor();
}

const randomRGBAColor = () => {
  const r = Math.floor(Math.random() * 256); //p5 References ??
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  phase += phaseSteps;
  const a = (Math.sin(phase) + 1) / 2;

  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

function mousePressed() {
  userStartAudio();

  for (let i = 0; i < balls.length; i++) {
    if (balls[i].collide(mouseX, mouseY)) {
      mouseDragBall = balls[i];
    }
  }
}

function mouseDragged() {
  if (mouseDragBall) {
    mouseDragBall.x = mouseX;
    mouseDragBall.y = mouseY;
    mouseDragBall.gravitySpeed = 0;
    clamp(mouseDragBall);
  }
}

function mouseReleased() {
  if (mouseDragBall) {
    mouseDragBall.gravitySpeed = 0;
  }
  mouseDragBall = null;
}