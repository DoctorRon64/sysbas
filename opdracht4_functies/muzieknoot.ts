export class MuziekNoot {
    constructor(fillColor: string, strokeColor: string, stokjelength: number, notesize: number, length: number) {
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
        this.stokjelength = stokjelength;
        this.notesize = notesize;
        this.noteLength = length;
    }

    private x: number = 0;
    private y: number = 0;
    private fillColor: string;
    private strokeColor: string;
    private stokjelength: number = 0;
    private notesize: number = 0;
    private noteLength: number = 0;

    update() {
        const stokjeX = this.x + this.notesize / 2;
        const stokjeTop = this.y - this.stokjelength;

        // Nootstok
        stroke(this.strokeColor);
        line(stokjeX, this.y, stokjeX, stokjeTop);

        // Nootkop
        fill(this.fillColor);
        stroke(this.strokeColor);
        circle(this.x, this.y, this.notesize);

        // Vlaggetjes
        if (this.noteLength >= 16) {
            this.tekenVlag(stokjeX, stokjeTop);
            this.tekenVlag(
                stokjeX,
                stokjeTop + this.notesize / 3
            );
        } else if (this.noteLength >= 8) {
            this.tekenVlag(stokjeX, stokjeTop);
        }
    }

    private tekenVlag(x: number, y: number) {
        noFill();
        stroke(this.strokeColor);

        beginShape();
        vertex(x, y);
        bezierVertex(x + this.notesize,y + this.notesize / 3, x + this.notesize, y + this.notesize, x + this.notesize / 2, y + this.notesize * 1.5 );
        endShape();
    }

    setLength(length: number) {
        this.noteLength = length;
    }

    move(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
