import p5 from "p5";

export class MuziekNoot {
    constructor(muziekNootColor: string, muziekNootStrokeColor: string, stokjelength: number, notesize: number, length: number) {
        this.muziekNootColor = muziekNootColor;
        this.muziekNootStrokeColor = muziekNootStrokeColor;
        this.stokjelength = stokjelength;
        this.notesize = notesize;
        this.noteLength = length;
    }

    private x: number = 0;
    private y: number = 0;
    private muziekNootColor: string;
    private muziekNootStrokeColor: string;
    private stokjelength: number = 0;
    private notesize: number = 0;
    private noteLength: number = 0;

    update() {
        const stokjeX = this.x + this.notesize / 2;
        const stokjeTop = this.y - this.stokjelength;

        // Nootstok
        stroke(this.muziekNootStrokeColor);
        line(stokjeX, this.y, stokjeX, stokjeTop);

        // Nootkop
        fill(this.muziekNootColor);
        stroke(this.muziekNootStrokeColor);
        circle(this.x, this.y, this.notesize);

        // Vlaggetjes
        if (this.noteLength >= 16) {
            this.tekenVlag(stokjeX, stokjeTop);
            this.tekenVlag(stokjeX, stokjeTop + this.notesize / 1.5);
        } else if (this.noteLength >= 8) {
            this.tekenVlag(stokjeX, stokjeTop);
        }
    }

    private tekenVlag(x: number, y: number): void {
        noFill();
        stroke(this.muziekNootColor);
        strokeWeight(2);

        beginShape();
        vertex(x, y);
        vertex(x + this.notesize, y + this.notesize / 2);
        vertex(x + this.notesize / 2, y + this.notesize * 1.5);
        endShape();
    }

    setLength(length: number) {
        this.noteLength = length;
    }

    move(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
    
    color(color: string) {
        this.muziekNootColor = color;
    }
}
