let bgcolor = 'rgb(148, 190, 23, 20)';
let notes = [60, 62, 64, 65, 67, 69];
let mouseDragBall;

let phase = 0;
let phaseSteps = 0.1;

class Ball {
  constructor(x, y, xSpeed, ySpeed, size, color, notes) {
    this.x = x;
    this.y = y;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.size = size;
    this.color = color;
    this.notes = notes;
    this.noteIndex = 0;

    this.centerTriggered = false;
    this.collisionTriggered = false;

    this.gravityForce = 120;
    this.gravity = 9.81 * this.gravityForce / (3600);
    this.gravitySpeed = 0
  }

  draw() {
    fill(this.color);
    circle(this.x, this.y, this.size);
  }

  move() {
    this.gravitySpeed += this.gravity;
    this.x += this.xSpeed;
    this.y += this.ySpeed + this.gravitySpeed;
  }

  collide(mouseX, mouseY) {
    let d = dist(mouseX, mouseY, this.x, this.y);
    return d < this.size / 2;
  }

  collideBall(other) {
    let d = dist(this.x, this.y, other.x, other.y);
    return d < (this.size / 2 + other.size / 2);
  }

  playNote() {
    let note = this.notes[this.noteIndex];
    let detune = map(this.x, 0, width, -0.2, 0.2);
    let tunedNote = note + detune;
    makeNote(tunedNote, 0.1, 100); this.noteIndex++;
    if (this.noteIndex >= this.notes.length) {
      this.noteIndex = 0;
    }
  }

  checkCenter() {
    let centerX = width / 2;
    let centerY = height / 2;

    let horizontalDistance = abs(this.x - centerX);
    let verticalDistance = abs(this.y - centerY);

    // Horizontal OR vertical center
    if (
      (horizontalDistance < this.size / 2 ||
        verticalDistance < this.size / 2)
      && !this.centerTriggered
    ) {
      makeNote(random(notes), 0.4, 500);
      this.centerTriggered = true;
      this.color = getRandomColor();
    }

    // Leave center
    if (
      horizontalDistance > this.size / 2 + 5 &&
      verticalDistance > this.size / 2 + 5
    ) {
      this.centerTriggered = false;
    }
  }
}

const ball1 = new Ball(100, 100, 10, 10, 120, '#e70000', [72, 74, 76, 79, 81]);
const ball2 = new Ball(200, 200, 5, 5, 80, '#154e7a', [50, 52, 54, 57, 59]);
const ball3 = new Ball(700, 600, 5, 5, 80, '#154e7a', [60, 62, 64, 67, 69]);

const balls = []

function setup() {
  createCanvas(800, 600);

  balls.push(ball1);
  balls.push(ball2);
  balls.push(ball3);
}

const activeCollisions = new Set();

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
function updateBall(ball) {
  if (mouseDragBall !== ball) {
    clamp(ball);
    ball.move();
  }

  ball.checkCenter();
  ball.draw();
}

//clamp to the width and height of the screen
function clamp(ball) {
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

function stuiter(ball) {
  ball.color = getRandomColor();
  bgcolor = randomRGBAColor();
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';

  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
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
    if (balls[i].collide(mouseX,mouseY)) {
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