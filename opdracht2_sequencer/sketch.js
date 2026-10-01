let bgcolor = "#174e3e";

let midinoteArray = [60, 62, 64, 68, 70]; //0-127
let amplitudeArray = [0.2, 0.4, 0.5, 0.1, 0.5]; //0. - 1.
let notelengthArray = [100, 200, 300, 500, 120];

let counter = 0;
let counterAmount = 1;
let frameDivide = 4;
let play = false;

class vierkant {
    constructor(x, y, size, corners) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.corners = corners;
    }
    
    update() {
        box(this.x, this.y, this.size);
    }
    
    rotate() {
        rotateX(frameCount * 0.01);
    }
   
    move(xPos, yPos) {
        translate(xPos,yPos);
    }

    color(r,g,b) {
        fill(r,g,b);
    }
}

let squares = [];

function setup() {
    createCanvas(800, 600, WEBGL);

    for (let i = 0; i < midinoteArray.length; i++) {
        squares.push(new vierkant(100, 100, 100, 20));
    }
}

function randomMidi() {
    let minMidi = 45;
    let maxMidi = 85;

    let minAmp = .5;
    let maxAmp = .9;

    let minLength = 250;
    let maxLength = 100;
    
    midinoteArray = [
        random(minMidi,maxMidi),
        random(minMidi,maxMidi),
        random(minMidi,maxMidi),
        random(minMidi,maxMidi),
        random(minMidi,maxMidi)
    ];
    amplitudeArray = [
        random(minAmp,maxAmp),
        random(minAmp,maxAmp),
        random(minAmp,maxAmp),
        random(minAmp,maxAmp),
        random(minAmp,maxAmp)
    ];
    notelengthArray = [
        random(minLength,maxLength),
        random(minLength,maxLength),
        random(minLength,maxLength),
        random(minLength,maxLength),
        random(minLength,maxLength)
    ]
}

function draw() {
    background(bgcolor);

    if ((frameCount / frameDivide) % 2 === 1) {
        counter += counterAmount;

        if (counter >= midinoteArray.length) {
            counter = 0;
        }

        let note = midinoteArray[counter];
        let amplitude = amplitudeArray[counter];
        let length = notelengthArray[counter];

        if (play) {
            makeNote(note, amplitude, length);
            randomMidi();
        }
    }

    for (let i = 0; i < squares.length; i++) {
        let xpos = (frameCount * 2 + i * 150) % 800 - 400;
        push();
        squares[i].move(xpos, 0);
        squares[i].rotate();

        if (i === counter) {
            squares[i].color(255, 0, 0);
        } else {
            squares[i].color(20, 100, 40);
        }

        squares[i].update();
        pop();
    }

    text(counter, 300, 300);
}

function keyPressed() {
userStartAudio();
  if (key === ' ') {

    play = !play;

    console.log(play);
  }
}