import { Vierkant } from "./vierkant";
import { MuziekNoot } from "./muzieknoot";
import { COLORS } from "./colors";
import { Sneltoets } from "./sneltoets";

let performRandomAct: boolean = false;

const sneltoetsen: Sneltoets[] = [
    { toetsen: [' '], naam: 'spatie', beschrijving: 'play / pause', actie: () => { play = !play; return play ? 'play' : 'pause'; } },
    { toetsen: ['q'], beschrijving: 'alles randomizen', actie: randomizeAllValues },
    { toetsen: ['o'], beschrijving: 'notenlijst omdraaien', actie: () => reverse() },
    { toetsen: ['r', 'arrowright'], naam: 'r / →', beschrijving: 'rechts roteren', actie: () => shiftLeft() },
    { toetsen: ['l', 'arrowleft'], naam: 'l / ←', beschrijving: 'links roteren', actie: () => shiftRight() },
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

type MuziekData = {
    midiNote: number;
    amplitude: number;
    length: number;
};

let muziekData: MuziekData[] = [
    { midiNote: 60, amplitude: 0.9, length: 0.9 },
    { midiNote: 64, amplitude: 0.4, length: 1 },
    { midiNote: 67, amplitude: 0.6, length: 0.7 },
    { midiNote: 72, amplitude: 0.3, length: 0.8 },
    { midiNote: 71, amplitude: 0.5, length: 0.6 },
    { midiNote: 60, amplitude: 0.7, length: 0.9 },
    { midiNote: 73, amplitude: 0.4, length: 0.5 }
];

// h. Verdere uitbreidingen
// Voer een (of meerdere) van de volgende opdrachten uit:
//     Zorg dat de vlaggetjes een vloeiende vorm hebben met bijvoorbeeld een bezier of spline curve.
//     Zorg dat je sequence een combinatie van kwart ♩, achtste ♪ en zestiende ♬ noten bevat, dat de timing klopt en dat de noten de juiste vorm hebben.
//     Een eigen creatieve uitbreiding.
//     (beoordeling: zeer goed)


const minAantalNoten: number = 2;
const maxAantalNoten: number = 16;
const laagsteNoot: number = 36;
const hoogsteNoot: number = 96;

const grondtoon: number = 60;
const toonladder: number[] = [0, 2, 4, 5, 7, 9, 11];

let bpm: number = 300;
let lastStepTime: number = 0;
let stap: number = 0;
let counter:  number = 0;

let frameDivider: number = 8;
const maxFrameDivider: number = 10;
let play: boolean = false;

let vierkanten: Vierkant[] = [];
const tussenruimte:  number = 10;
const maxGrootte:  number = 60;
let afstand: number = 0;

let volume: number = 0.5;
let feedbackTekst:  ReturnType<typeof createDiv>;

function setup() {
    createCanvas(800, 600, WEBGL);

    createDiv(sneltoetsen.map((s) => `${s.naam ?? s.toetsen[0]} = ${s.beschrijving}`).join('<br>') +
        '<br>↑ / ↓ = volume (ingedrukt houden)<br>klik = kubus muten')
        .position(10, 10)
        .style('font: 12px monospace; color: white;');

    feedbackTekst = createDiv("")
        .position(0, height - 50)
        .style(`width: ${width}px; text-align: center; font: 24px monospace; color: black;`);

    for (let i = 0; i < muziekData.length; i++) {
        vierkanten.push(createVierkant());
    }
    
    randomizeAllValues();
}

function randomizeAllValues() {
    muziekData = muziekData.map(() => ({
        midiNote: randomNote(),
        amplitude: randomAmplitude(),
        length: randomNoteLength()
    }));

    frameDivider = round(random(5, maxFrameDivider));
    updateVierkanten();
}

const randomNote = (): number => round(random(50, 90));
const randomNoteInScale = (): number => {
    let octaaf: number = floor(random(-1, 2)) * 12;
    return grondtoon + octaaf + random(toonladder);
};
const randomAmplitude = (): number => round(random(0.2, 0.8), 2);
const randomNoteLength = (): number => round(random(0.3, 1), 2);

function addNote(noot: number): string | void {
    if (muziekData.length >= maxAantalNoten) {
        return `maximaal ${maxAantalNoten} noten`;
    }

    muziekData.push({
        midiNote: noot,
        amplitude: randomAmplitude(),
        length: randomNoteLength()
    });

    vierkanten.push(createVierkant());
    updateVierkanten();
}

function deleteNote(lastNote: boolean): string | void {
    if (muziekData.length <= minAantalNoten) {
        return `minimaal ${minAantalNoten} noten`;
    }

    if (lastNote) {
        muziekData.pop();
        vierkanten.pop()?.verwijder();
    } else {
        muziekData.shift();
        vierkanten.shift()?.verwijder();
    }
    updateVierkanten();
}

function transponeer(semitonen: number) {
    muziekData = muziekData.map((data) => ({ ...data,
        midiNote: constrain(
            data.midiNote + semitonen,
            laagsteNoot,
            hoogsteNoot
        )
    }));
}

function transponeerInToonladder(stappen: number) {
    muziekData = muziekData.map((data) => {
        let index = toonladderPositie(data.midiNote) + stappen;
        index = constrain( index, toonladderPositie(laagsteNoot), toonladderPositie(hoogsteNoot));
        return { ...data, midiNote: nootVanToonladderPositie(index) };
    });
}

function toonladderPositie(noot: number): number {
    let relatief = noot - grondtoon;
    let octaaf = floor(relatief / 12);
    let positie = ((relatief % 12) + 12) % 12;

    let index = toonladder.filter(
        (toon) => toon <= positie
    ).length - 1;

    return octaaf * toonladder.length + index;
}

function nootVanToonladderPositie(index: number): number {
    let octaaf = floor(index / toonladder.length);
    let toonIndex = ((index % toonladder.length) + toonladder.length)
        % toonladder.length;

    return grondtoon + octaaf * 12 + toonladder[toonIndex];
}

function notelengthFromMidiNote() {
    muziekData = muziekData.map((data) => ({ ...data,
        length: round(
            map(data.midiNote, 50, 90, 1, 0.3, true),
            2
        )
    }));
}

function reverse() {
    muziekData.reverse();
}

function shiftLeft() {
    muziekData.unshift(muziekData.pop()!);
}

function shiftRight() {
    muziekData.push(muziekData.shift()!);
}

function createVierkant(): Vierkant {
    return new Vierkant(COLORS.VierkantON, COLORS.VierkantOFF, COLORS.VierkantMUTED, new MuziekNoot(
        COLORS.Note, color(0), 25, 10, 8)
    );
}

function updateVierkanten() {
    if (vierkanten.length === 0) return;

    afstand = width / vierkanten.length;

    const grootte = min(
        (afstand - tussenruimte) / sqrt(3),
        maxGrootte
    );

    vierkanten.forEach((vierkant, i) => {
        vierkant.size = grootte;
        vierkant.noot = muziekData[i].midiNote;
    });
}

function voerUit(sneltoets: Sneltoets, label: string) {
    let melding = sneltoets.actie();
    updateVierkanten();
    feedbackTekst.html(`[${label}] ${melding ?? sneltoets.beschrijving}`);
}

function draw() {
    background(COLORS.Background);
    lights();

    updateSequencer();
    updateRandomActions();
    updateVolume();

    tekenVierkanten();
}

function tekenVierkanten() {
    for (let i = 0; i < vierkanten.length; i++) {
        let vierkant = vierkanten[i];

        let xpos = (frameCount * 2 + i * afstand) % width - width / 2;
        //let ypos = sin(frameCount * 0.03 + i) * 30;
        let ypos = 0;

        push();
        vierkant.move(xpos, ypos);
        vierkant.tekst(vierkant.muted ? "mute" : vierkant.nootNaam(vierkant.noot));
        vierkant.rotate(0.01);
        vierkant.color(play && i === counter, 1, vierkant.noot);
        vierkant.update();
        pop();

        push();
        vierkant.nootUpdate();
        vierkant.nootMove(xpos, ypos - 80);
        pop();
    }
}

function updateSequencer() {
    const stepDuration = 60000 / bpm;

    if (millis() - lastStepTime < stepDuration) {
        return;
    }

    lastStepTime = millis();

    counter = stap % muziekData.length;
    const data = muziekData[counter];

    if (play && !vierkanten[counter].muted && volume > 0) {
        makeNote(data.midiNote, data.amplitude * volume, data.length * 1000);
    }

    stap++;
}


function updateVolume() {
    if (keyIsDown(UP_ARROW)) {
        volume = min(volume + 0.01, 1);
        feedbackTekst.html(`[volume: ${round(volume, 2)}]`);
    }

    if (keyIsDown(DOWN_ARROW)) {
        volume = max(volume - 0.01, 0);
        feedbackTekst.html(`[volume: ${round(volume, 2)}]`);
    }
}

function updateRandomActions() {
    if (!performRandomAct || random() >= 0.1) {
        return;
    }

    let toets = random(randomToetsen);
    let sneltoets = sneltoetsen.find(
        (s) => s.toetsen.includes(toets)
    );

    if (sneltoets) {
        voerUit(sneltoets, 'random');
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
