import { Vierkant } from "./vierkant";

let bgColor: string = "#13b4bd";
let vierkantAan: string = "#ff8800";
let vierkantUit: string = "#ffffff";
let vierkantMuted: string = "#6e6e6e";

let aantalVierkanten: number = 8;
let midinoteArray: number[] = [60, 64, 67, 72, 71, 60, 73];
let amplitudeArray: number[] = [0.9, 0.4, 0.6, 0.3, 0.5];
let notelengthArray: number[] = [0.9, 1, 0.7, 0.8];

let stap: number = 0;
let counter: number = 0;
let counterStep: number = 1;

let frameDivider: number = 8;
let maxFrameDivider: number = 10;
let play: boolean = false;

let vierkanten: Vierkant[] = [];
let tussenruimte: number = 10;
let afstand: number = 0;

let huidigeNoot: number = 60;
let infoTekst: ReturnType<typeof createDiv>;

let keyList: string[] = [' ', 'q', 'o', 'r', 'l', 'a', 't', 'b', 'd', '+', '-'];


function setup() {
    createCanvas(800, 600, WEBGL);

    // text() werkt in WEBGL alleen met een geladen font, dus een HTML-laag erboven
    infoTekst = createDiv("");
    infoTekst.position(10, 10);
    infoTekst.style("color", "white");
    infoTekst.style("font-family", "monospace");

    afstand = width / aantalVierkanten;
    // een draaiende kubus is op zijn breedst sqrt(3) keer zijn zijde
    let grootte: number = (afstand - tussenruimte) / sqrt(3);

    for (let i = 0; i < aantalVierkanten; i++) {
        vierkanten.push(new Vierkant(100, 100, grootte, vierkantAan, vierkantUit, vierkantMuted));
    }

    randomizeAllValues();

    for (let i = 0; i < vierkanten.length; i++) {
        vierkanten[i].noot = midinoteArray[i % midinoteArray.length];
    }
}

function randomizeAllValues() {
    midinoteArray = midinoteArray.map(() => randomizeMIDI());
    amplitudeArray = amplitudeArray.map(() => round(random(0.2, 0.8), 2));
    notelengthArray = notelengthArray.map(() => round(random(0.3, 1), 2));
    frameDivider = round(random(5, maxFrameDivider));

    updateTextInVierkanten();
}

function randomizeMIDI() {
    return round(random(50, 90));
}

function updateTextInVierkanten() {
    for (let i = 0; i < vierkanten.length; i++) {
        vierkanten[i].noot = midinoteArray[i % midinoteArray.length];
    }
}

function draw() {
    background(bgColor);
    lights();

    if ((frameCount / frameDivider) % 1 === 0) {
        counter = stap % vierkanten.length;
        let midiNote: number = midinoteArray[stap % midinoteArray.length];
        let amplitude: number = amplitudeArray[stap % amplitudeArray.length];
        let noteLength: number = notelengthArray[stap % notelengthArray.length];
        huidigeNoot = midiNote;
        //vierkanten[counter].noot = midiNote;
        if (play && !vierkanten[counter].muted) {
            makeNote(midiNote, amplitude, noteLength * 1000);
           // console.log(midiNote, amplitude, noteLength * 1000, frameDivider);
            let message: string = `
                o = notenlijst omdraaien <br>
                r = notenlijst naar rechts roteren <br>
                l = notenlijst naar links roteren <br>
                a = random noot toevoegen <br>
                t = noot binnen toonsoort toevoegen <br>
                b = noot aan het eind van de lijst verwijderen <br>
                d = noot aan het begin van de lijst verwijderen <br>
                + = alle noten één semitoon omhoog <br>
                - = alle noten één semitoon omlaag <br>` + 
                ` stap: ${counter}<br>` +
                `midiNote: ${midiNote}<br>` +
                `amplitude: ${amplitude}<br>` +
                `noteLength: ${noteLength * 1000}<br>` +
                `framDivider: ${frameDivider} <br><br>`;
            infoTekst.html(message);
        }
        stap += counterStep;
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
            vierkant.color(true, 1, huidigeNoot);
        } else {
            vierkant.color(false);
        }

        vierkant.update();
        pop();
    }
}

function keyPressed() {
    switch(key) {
        case keyList[0]:
            play = !play;
        break;
        case keyList[1]:
            randomizeAllValues();
        break;
        case keyList[2]:
            midinoteArray.reverse();
            for (let i = 0; i < midinoteArray.length; i++ ) {
                console.log(midinoteArray[i]);
            }
            updateTextInVierkanten();
        break;
        case keyList[3]: 
            //shift drukt moeten de elementen uit de lijst met midinoten één plaats naar rechts roteren
        break;
        case keyList[4]:
            // drukt moeten de elementen uit de lijst met midinoten één plaats naar links roteren. 
        break;
        case keyList[5]:
            // drukt moet er random één noot worden toegevoegd aan het eind van de lijst met noten.
            // Zorg dat de range van dit getal enigszins logisch is. Gebruik dus geen random tussen 0 en 127,
            // maar een aangepaste range voor random. Vergeet ook niet de lijst met duur en amplitude aan te passen.
        break;
        case keyList[6]:
            // drukt, zorg dan dat er een noot wordt toegevoegd die binnen de toonsoort past
            // die je aan het begin van deze opdracht hebt ingevuld.
        break;
        case keyList[7]:
            // drukt moet de laatste noot uit de lijst verwijderd worden, 
            // zorg daarbij dat de lijst niet korter kan worden dan 2 noten. 
            // Vergeet ook niet de duur en amplitude aan te passen.
        break;
        case keyList[8]:
            //  drukt moet de eerste noot uit de lijst verwijderd worden,
            //  zorg daarbij dat de lijst niet korter kan worden dan 2 noten.
        break;
        case keyList[9]:
            //     drukt moeten alle noten uit de lijst 1 semitoon omhoog gaan.
            // het resultaat zou als volgt kunnen zijn:
        break;
        case keyList[10]:
            //    drukt moeten alle noten uit de lijst 1 semitoon omlaag gaan.
            //    het resultaat zou als volgt kunnen zijn:
        break;
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