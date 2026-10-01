const notes: number[] = [60, 62, 64, 65, 67, 69];

export function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var hex = '#';

    for (var i = 0; i < 6; i++) {
        hex += letters[Math.floor(Math.random() * 16)];
    }

    return hex;
}

export class Ball {
    constructor(x: number, y: number, xSpeed: number, ySpeed: number, size: number, color: string, notes: number[]) {
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

    x: number;
    y: number;
    xSpeed: number;
    ySpeed: number;
    size: number;
    color: string;
    notes: number[];
    noteIndex: number;
    centerTriggered: boolean;
    collisionTriggered: boolean;
    gravityForce: number;
    gravity: number;
    gravitySpeed: number;

    draw() {
        fill(this.color);
        circle(this.x, this.y, this.size);
    }

    move() {
        this.gravitySpeed += this.gravity;
        this.x += this.xSpeed;
        this.y += this.ySpeed + this.gravitySpeed;
    }

    collide(mouseX: number, mouseY: number) {
        let d = dist(mouseX, mouseY, this.x, this.y);
        return d < this.size / 2;
    }

    collideBall(other: Ball) {
        let d = dist(this.x, this.y, other.x, other.y);
        return d < (this.size / 2 + other.size / 2);
    }

    playNote() {
        let note = this.notes[this.noteIndex];
        let detune = map(this.x, 0, width, -0.2, 0.2);
        let tunedNote = note + detune;
        makeNote(tunedNote, 0.8, 500); this.noteIndex++;
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