import { Vierkant } from "./vierkant";

const COLORS = {
    background: "#13b4bd",
    noteOn: "#ff8800",
    noteOff: "#ffffff",
    noteMuted: "#6e6e6e",
} as const;

type Sneltoets = {
    toetsen: string[];
    naam?: string;
    beschrijving: string;
    // een teruggegeven tekst vervangt de beschrijving in de feedback
    actie: () => string | void;
};

let performRandomAct: boolean = false;

const sneltoetsen: Sneltoets[] = [
    { toetsen: [' '], naam: 'spatie', beschrijving: 'play / pause', actie: () => { play = !play; return play ? 'play' : 'pause'; } },
    { toetsen: ['q'], beschrijving: 'alles randomizen', actie: randomizeAllValues },
    { toetsen: ['o'], beschrijving: 'notenlijst omdraaien', actie: () => { midinoteArray.reverse(); } },
    { toetsen: ['r', 'arrowright'], naam: 'r / →', beschrijving: 'rechts roteren', actie: () => { midinoteArray.unshift(midinoteArray.pop()!); } },
    { toetsen: ['l', 'arrowleft'], naam: 'l / ←', beschrijving: 'links roteren', actie: () => { midinoteArray.push(midinoteArray.shift()!); } },
    { toetsen: ['a'], beschrijving: 'random noot +', actie: () => addNote(randomNote()) },
    { toetsen: ['t'], beschrijving: 'toonsoort noot +', actie: () => addNote(randomNoteInScale()) },
    { toetsen: ['b'], beschrijving: 'laatste noot -', actie: () => deleteNote(true) },
    { toetsen: ['d'], beschrijving: 'eerste noot -', actie: () => deleteNote(false) },
    { toetsen: ['+', '='], naam: '+', beschrijving: 'semitoon ↑', actie: () => transponeer(1) },
    { toetsen: ['-'], beschrijving: 'semitoon ↓', actie: () => transponeer(-1) },
    { toetsen: ['s'], beschrijving: 'toonladder ↑', actie: () => transponeerInToonladder(1) },
    { toetsen: ['x'], beschrijving: 'toonladder ↓', actie: () => transponeerInToonladder(-1) },
    { toetsen: ['v'], beschrijving: 'notelength = notetoon', actie: () => notelengthFromMidiNote() },
    { toetsen: ['z'], beschrijving: 'random acties aan/uit', actie: () => { performRandomAct = !performRandomAct; return `random acties ${performRandomAct ? 'aan' : 'uit'}`; } },
];

const randomToetsen: string[] = ['o', 'r', 'l', 'a', 't', 'b', 'd', '+', '-', 's', 'x'];

// noot, amplitude en lengte horen per index bij elkaar, dus deze lijsten zijn altijd even lang
let midinoteArray: number[] = [60, 64, 67, 72, 71, 60, 73];
let amplitudeArray: number[] = [0.9, 0.4, 0.6, 0.3, 0.5, 0.7, 0.4];
let notelengthArray: number[] = [0.9, 1, 0.7, 0.8, 0.6, 0.9, 0.5];
const minAantalNoten: number = 2;
const maxAantalNoten: number = 16;
const laagsteNoot: number = 36;
const hoogsteNoot: number = 96;

const grondtoon: number = 60;
const toonladder: number[] = [0, 2, 4, 5, 7, 9, 11];

let stap: number = 0;
let counter: number = 0;
const counterStep: number = 1;

let frameDivider: number = 8;
const maxFrameDivider: number = 10;
let play: boolean = false;

let vierkanten: Vierkant[] = [];
const tussenruimte: number = 10;
const maxGrootte: number = 60;
let afstand: number = 0;

let volume: number = 0.5;
let feedbackTekst: ReturnType<typeof createDiv>;

function setup() {
    createCanvas(800, 600, WEBGL);

    createDiv(sneltoetsen.map((s) => `${s.naam ?? s.toetsen[0]} = ${s.beschrijving}`).join('<br>') +
        '<br>↑ / ↓ = volume (ingedrukt houden)<br>klik = kubus muten')
        .position(10, 10)
        .style('font: 12px monospace; color: white;');

    feedbackTekst = createDiv("")
        .position(0, height - 50)
        .style(`width: ${width}px; text-align: center; font: 24px monospace; color: black;`);

    for (let i = 0; i < midinoteArray.length; i++) {
        vierkanten.push(new Vierkant(COLORS.noteOn, COLORS.noteOff, COLORS.noteMuted));
    }

    randomizeAllValues();
}

function randomizeAllValues() {
    midinoteArray = midinoteArray.map(randomNote);
    amplitudeArray = amplitudeArray.map(randomAmplitude);
    notelengthArray = notelengthArray.map(randomNoteLength);
    frameDivider = round(random(5, maxFrameDivider));

    updateVierkanten();
}

//Values
const randomNote = (): number => round(random(50, 90));
const randomNoteInScale = (): number => {
    let octaaf: number = floor(random(-1, 2)) * 12;
    return grondtoon + octaaf + random(toonladder);
};
const randomAmplitude = (): number => round(random(0.2, 0.8), 2);
const randomNoteLength = (): number => round(random(0.3, 1), 2);

function addNote(noot: number): string | void {
    if (midinoteArray.length >= maxAantalNoten) {
        return `maximaal ${maxAantalNoten} noten`;
    }
    midinoteArray.push(noot);
    amplitudeArray.push(randomAmplitude());
    notelengthArray.push(randomNoteLength());
    vierkanten.push(new Vierkant(COLORS.noteOn, COLORS.noteOff, COLORS.noteMuted));
}

function deleteNote(lastNote: boolean): string | void {
    if (midinoteArray.length <= minAantalNoten) {
        return `minimaal ${minAantalNoten} noten`;
    }
    if (lastNote) {
        midinoteArray.pop();
        amplitudeArray.pop();
        notelengthArray.pop();
        vierkanten.pop()!.verwijder();
    } else {
        midinoteArray.shift();
        amplitudeArray.shift();
        notelengthArray.shift();
        vierkanten.shift()!.verwijder();
    }
}

function transponeer(semitonen: number) {
    midinoteArray = midinoteArray.map((noot) => constrain(noot + semitonen, laagsteNoot, hoogsteNoot));
}

// noten buiten de toonladder schuiven eerst naar de toon eronder
function transponeerInToonladder(stappen: number) {
    midinoteArray = midinoteArray.map((noot) => {
        let vanafGrondtoon: number = noot - grondtoon;
        let octaaf: number = floor(vanafGrondtoon / 12);
        let positie: number = vanafGrondtoon - octaaf * 12;
        let index: number = octaaf * toonladder.length + toonladder.filter((t) => t <= positie).length - 1 + stappen;

        let nieuwOctaaf: number = floor(index / toonladder.length);
        let toon: number = toonladder[index - nieuwOctaaf * toonladder.length];
        return constrain(grondtoon + nieuwOctaaf * 12 + toon, laagsteNoot, hoogsteNoot);
    });
}

function notelengthFromMidiNote() {
    notelengthArray = midinoteArray.map((noot) => round(map(noot, 50, 90, 1, 0.3, true), 2));
}

function updateVierkanten() {
    afstand = width / vierkanten.length;
    // een draaiende kubus is op zijn breedst sqrt(3) keer zijn zijde
    let grootte: number = min((afstand - tussenruimte) / sqrt(3), maxGrootte);

    for (let i = 0; i < vierkanten.length; i++) {
        vierkanten[i].size = grootte;
        vierkanten[i].noot = midinoteArray[i];
    }
}

function voerUit(sneltoets: Sneltoets, label: string) {
    let melding = sneltoets.actie();
    updateVierkanten();
    feedbackTekst.html(`[${label}] ${melding ?? sneltoets.beschrijving}`);
}

function draw() {
    background(COLORS.background);
    lights();

    if (frameCount % frameDivider === 0) {
        counter = stap % midinoteArray.length;
        if (play && !vierkanten[counter].muted && volume > 0) {
            let noteVolume: number = amplitudeArray[counter] * volume;
            makeNote(midinoteArray[counter], noteVolume, notelengthArray[counter] * 1000);
        }
        stap += counterStep;

        if (performRandomAct && random() < 0.1) {
            let toets: string = random(randomToetsen);
            voerUit(sneltoetsen.find((s) => s.toetsen.includes(toets))!, 'random');
        }
    }

    for (let i = 0; i < vierkanten.length; i++) {
        let vierkant: Vierkant = vierkanten[i];
        let xpos: number = (frameCount * 2 + i * afstand) % width - width / 2;
        let ypos: number = sin(frameCount * 0.03 + i) * 30;
        push();
        vierkant.move(xpos, ypos);
        vierkant.tekst(vierkant.muted ? "mute" : vierkant.nootNaam(vierkant.noot));
        vierkant.rotate(0.01);

        if (play && i === counter) {
            vierkant.color(true, 1, vierkant.noot);
        } else {
            vierkant.color(false);
        }

        vierkant.update();
        pop();
    }

    if (keyIsDown('ArrowUp')) {
        volume = min(volume + 0.01, 1);
        feedbackTekst.html(`[volume: ${round(volume, 2)}]`);
    }
    if (keyIsDown('ArrowDown')) {
        volume = max(volume - 0.01, 0);
        feedbackTekst.html(`[volume: ${round(volume, 2)}]`);
    }
}

function keyPressed() {
    let sneltoets = sneltoetsen.find((s) => s.toetsen.includes(key.toLowerCase()));
    if (!sneltoets) {
        return;
    }
    voerUit(sneltoets, sneltoets.naam ?? key);
    return false;
}

function mousePressed() {
    for (let vierkant of vierkanten) {
        if (vierkant.select(mouseX, mouseY)) {
            vierkant.toggleMute();
        }
    }
}
