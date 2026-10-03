import { Vierkant } from "./vierkant";

let bgColor: string = "#0000ff";
let vierkantAan: string = "#ff8800";
let vierkantUit: string = "#ffffff";
let vierkantMuted: string = "#6e6e6e";

let aantalVierkanten: number = 7;
let midinoteArray: number[] = [60, 64, 67, 72, 71, 60, 73];
let amplitudeArray: number[] = [0.9, 0.4, 0.6, 0.3, 0.5];
let notelengthArray: number[] = [0.9, 1, 0.7, 0.8];

let stap: number = 0;
let counter: number = 0;
let counterStep: number = 1;

let framDivider: number = 8;
let play: boolean = false;

let vierkanten: Vierkant[] = [];
let tussenruimte: number = 10;
let afstand: number = 0;

let huidigeNoot: number = 60;

function setup() {
    createCanvas(800, 600, WEBGL);

    afstand = width / aantalVierkanten;
    // een draaiende kubus is op zijn breedst sqrt(3) keer zijn zijde
    let grootte: number = (afstand - tussenruimte) / sqrt(3);

    for (let i = 0; i < aantalVierkanten; i++) {
        vierkanten.push(new Vierkant(100, 100, grootte, vierkantAan, vierkantUit, vierkantMuted));
    }

    randomMidi();
}

function randomMidi() {
    midinoteArray = midinoteArray.map(() => round(random(50, 90)));
    amplitudeArray = amplitudeArray.map(() => round(random(0.2, 0.8), 2));
    notelengthArray = notelengthArray.map(() => round(random(0.3, 1), 2));
    framDivider = round(random(5, 10));
}

function draw() {
    background(bgColor);

    if ((frameCount / framDivider) % 1 === 0) {
        counter = stap % vierkanten.length;
        let midiNote: number = midinoteArray[stap % midinoteArray.length];
        let amplitude: number = amplitudeArray[stap % amplitudeArray.length];
        let noteLength: number = notelengthArray[stap % notelengthArray.length];
        huidigeNoot = midiNote;
        if (play && !vierkanten[counter].muted) {
            makeNote(midiNote, amplitude, noteLength * 1000);
            console.log(midiNote, amplitude, noteLength * 1000, framDivider);
        }
        stap += counterStep;
    }

    for (let i = 0; i < vierkanten.length; i++) {
        let vierkant: Vierkant = vierkanten[i];
        let xpos: number = (frameCount * 2 + i * afstand) % width - width / 2;
        let ypos: number = sin(frameCount * 0.03 + i) * 30;
        push();
        vierkant.move(xpos, ypos);
        vierkant.rotate(0.01);

        if (play && i === counter) {
            vierkant.color(true, 1, huidigeNoot);
        } else {
            vierkant.color(false);
        }

        vierkant.update();
        pop();
    }

    text(counter, 10, 10);
}

function keyPressed() {
    if (key === ' ') {
        play = !play;
    } else if (key === 'r') {
        randomMidi();
    }
}

function mousePressed() {
    for (let vierkant of vierkanten) {
        if (vierkant.select(mouseX, mouseY)) {
            vierkant.toggleMute();
        }
    }
}

function mouseReleased() {

}