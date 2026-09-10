var bgcolor = '#73d10e';
let notes = [60, 62, 64, 65, 67, 69, 71, 72];

class Ball {
  constructor(x, y, xSpeed, ySpeed, size, color) {
    this.x = x;
    this.y = y;
    this.xSpeed = xSpeed;
    this.ySpeed = ySpeed;
    this.size = size;
    this.color = color;
    this.gravity = 0.05;
    this.gravitySpeed = 0;
  }
  draw() {
    fill(this.color);
    circle(this.x,this.y,this.size);
  }
}

const ballr = new Ball(100, 100, 10, 10, 80, '#000000');
const ballr2 = new Ball(200, 200, 5, 5, 250, '#000000');

function setup() {
  //plaats hier de code die maar één keer hoeft te worden uitgevoerd
  createCanvas(800,600);
  background(bgcolor);
}

function draw() {
  background(bgcolor);
  updateBall(ballr);
  updateBall(ballr2);
}

function updateBall(Ball) {
  clamp(Ball);
  move(Ball);
  Ball.draw();
}

function move (Ball) {
  Ball.gravitySpeed += Ball.gravity;
  Ball.x += Ball.xSpeed;
  Ball.y += Ball.ySpeed + Ball.gravitySpeed;
}

function clamp(ball) {
  if ((ball.x + ball.size / 2) >= width || (ball.x - ball.size / 2) <= 0) {
    ball.xSpeed = -ball.xSpeed;
    stuiter(ball);
  }
  if ((ball.y + ball.size / 2) >= height || (ball.y - ball.size / 2) <= 0) {
    ball.ySpeed = -ball.ySpeed;
    stuiter(ball);
  }
}

function stuiter(Ball) {
  Ball.color = getRandomColor();
  bgcolor = getRandomColor();

  makeNote(random(notes), .4, 500);
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

  if (!osc.started) {
    osc.start();
  }
}