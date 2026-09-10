var bgcolor = '#12b4c3';
let notes = [60, 62, 64, 65, 67, 69];
let draggedBall;

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

    this.gravity = 9.81 * 50 / (60 * 60);
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

const ball1 = new Ball(100, 100, 10, 10, 80, '#e70000', [72, 74, 76, 79, 81]);
const ball2 = new Ball(200, 200, 5, 5, 150, '#154e7a', [50, 52, 54, 57, 59]);

function setup() {
  createCanvas(800, 600);
}

function draw() {
  background(bgcolor);

  //collide with another ball and playnotes
  if (ball1.collideBall(ball2)) {
    if (!ball1.collisionTriggered) {
      ball1.xSpeed = -ball1.xSpeed;
      ball1.ySpeed = -ball1.ySpeed;
      ball2.xSpeed = -ball2.xSpeed;
      ball2.ySpeed = -ball2.ySpeed;
      ball1.gravitySpeed = 0; ball2.gravitySpeed = 0;
      ball1.playNote(); 
      ball2.playNote();
      stuiter(ball1); 
      stuiter(ball2);
      ball1.collisionTriggered = true;
    }
  } else {
    ball1.collisionTriggered = false;
  }
  updateBall(ball1);
  updateBall(ball2);

}

//update the balls different functions
function updateBall(ball) {
  if (draggedBall !== ball) {
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
  bgcolor = getRandomColor();
  //makeNote(random(notes), 0.1, 100);
}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';

  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }

  return color;
}

function mousePressed() {
  userStartAudio();

  if (ball1.collide(mouseX, mouseY)) {
    draggedBall = ball1;
  } else if (ball2.collide(mouseX, mouseY)) {
    draggedBall = ball2;
  }
}

function mouseDragged() {
  if (draggedBall) {
    draggedBall.x = mouseX;
    draggedBall.y = mouseY;
    draggedBall.gravitySpeed = 0;
    clamp(draggedBall);
  }
}

function mouseReleased() {
  if (draggedBall) {
    draggedBall.gravitySpeed = 0; 
  }
  draggedBall = null;
}