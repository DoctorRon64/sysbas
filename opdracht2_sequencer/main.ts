import { Vierkant } from "./vierkant";

let bgColor: string = "#0000ff";
let vierkantAan: string = "#ff8800";
let vierkantUit: string = "#ffffff";
let vierkantMuted: string = "#888888";

let midinoteArray: number[] = [60, 60, 60, 60, 60, 60];
let amplitudeArray: number[] = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];
let notelengthArray: number[] = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6];

let counter: number = 0;
let counterStep: number = 1;
let framDivider: number = 10;
let play: boolean = false;

let vierkanten: Vierkant[] = [];
let tussenruimte: number = 10;
let afstand: number = 0;

let huidigeNoot: number = 60;

function setup() {
    createCanvas(800, 600, WEBGL);

    afstand = width / midinoteArray.length;
    // een draaiende kubus is op zijn breedst sqrt(3) keer zijn zijde
    let grootte: number = (afstand - tussenruimte) / sqrt(3);

    for (let i = 0; i < midinoteArray.length; i++) {
        vierkanten.push(new Vierkant(100, 100, grootte, vierkantAan, vierkantUit, vierkantMuted));
    }
}

function randomMidi() {
    let minMidi: number = 45;
    let maxMidi: number = 80;
    midinoteArray = [
        random(minMidi, maxMidi),
        random(minMidi, maxMidi),
        random(minMidi, maxMidi),
        random(minMidi, maxMidi),
        random(minMidi, maxMidi),
        random(minMidi, maxMidi)
    ];

    let minAmp: number = 0.5;
    let maxAmp: number = 0.9;
    amplitudeArray = [
        random(minAmp, maxAmp),
        random(minAmp, maxAmp),
        random(minAmp, maxAmp),
        random(minAmp, maxAmp),
        random(minAmp, maxAmp),
        random(minAmp, maxAmp)
    ];

    let minNoteLength: number = .1;
    let maxNoteLength: number = 1;
    notelengthArray = [
        random(minNoteLength, maxNoteLength),
        random(minNoteLength, maxNoteLength),
        random(minNoteLength, maxNoteLength),
        random(minNoteLength, maxNoteLength),
        random(minNoteLength, maxNoteLength),
        random(minNoteLength, maxNoteLength)
    ];
}

function draw() {
    background(bgColor);

    if ((frameCount / framDivider) % 1 === 0) {
        counter += counterStep;

        if (counter >= vierkanten.length) {
            counter = 0;
        }

        let midiNote: number = midinoteArray[counter];
        let amplitude: number = amplitudeArray[counter];
        let noteLength: number = notelengthArray[counter];
        huidigeNoot = midiNote;

        if (play && !vierkanten[counter].muted) {
            makeNote(midiNote, amplitude, noteLength * 1000);
            randomMidi();
        }
    }

    for (let i = 0; i < vierkanten.length; i++) {
        let vierkant: Vierkant = vierkanten[i];
        let xpos: number = (frameCount * 2 + i * afstand) % width - width / 2;
        let ypos: number = Math.sin(frameCount * 0.01);
        push();
        vierkant.move(xpos, ypos);
        vierkant.rotate(0.01);

        if (play && i === counter) {
            let a: number = ((Math.sin(frameCount * 0.01) + 1) / 2) + .5;

            vierkant.color(true, a, huidigeNoot);
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