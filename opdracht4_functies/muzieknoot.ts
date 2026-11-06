export class MuziekNoot {
    constructor(fillColor: string, strokeColor: string, stokjelength: number, notesize: number) { 
        this.fillColor = fillColor;
        this.strokeColor = strokeColor;
        this.stokjelength = stokjelength;
        this.notesize = notesize;
    } 
    
    x: number = 0;
    y: number = 0;
    size: number = 0;
    fillColor: string;
    strokeColor: string;
    stokjelength: number = 0;
    notesize:number = 0;
    
    update() {
        let stokjeX: number = this.x + (this.notesize / 2);
        fill(this.strokeColor);
        line(stokjeX, this.y, stokjeX, this.y - this.stokjelength);
        fill(this.fillColor);
        stroke(this.strokeColor);
        circle(this.x,this.y,this.notesize);
    }

    move(x: number, y: number) {
        this.x = x;
        this.y = y;
        translate(x, y);
    }
}