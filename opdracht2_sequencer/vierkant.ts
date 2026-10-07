export class Vierkant {
    label: ReturnType<typeof createDiv>;

    constructor(x: number, y: number, size: number, colorAan: string, colorUit: string, colorMuted: string) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.colorAan = colorAan;
        this.colorUit = colorUit;
        this.colorMuted = colorMuted;
        this.huidigeKleur = color(colorUit);
        this.huidigeRand = color(0);

        this.label = createDiv("");
        this.label.style("color", "black");
        this.label.style("font-family", "monospace");
        this.label.style("transform", "translate(-50%, -50%)");
        this.label.style("pointer-events", "none");
    }

    x: number;
    y: number;
    size: number;
    colorAan: string;
    colorUit: string;
    colorMuted: string;
    muted: boolean = false;
    noot: number = 60;
    huidigeKleur: ReturnType<typeof color>;
    huidigeRand: ReturnType<typeof color>;
    // 0 = verandert nooit, 1 = springt meteen naar de nieuwe kleur
    lerpSnelheid: number = .45;

    tekst(inhoud: string) {
        this.label.html(inhoud);
        this.label.position(this.x + width / 2, this.y + height / 1.9 + this.size);
    }

    toggleMute() {
        this.muted = !this.muted;
    }

    update() {
        box(this.size);
    }

    rotate(angle: number) {
        rotateX(angle * frameCount);
        rotateY(angle * frameCount);
    }

    move(x: number, y: number) {
        this.x = x;
        this.y = y;
        translate(x, y);
    }

    nootNaam(noot: number): string {
        let namen: string[] = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        return namen[noot % 12] + (floor(noot / 12) - 1);
    }

    select(mx: number, my: number): boolean {
        // mouseX/mouseY beginnen linksboven, WEBGL-coördinaten in het midden
        let dx: number = mx - width / 2 - this.x;
        let dy: number = my - height / 2 - this.y;
        return abs(dx) <= this.size / 2 && abs(dy) <= this.size / 2;
    }

    color(aan: boolean, alpha: number = 1, noot?: number) {
        let c: ReturnType<typeof color>;
        let rand: ReturnType<typeof color>;
        if (this.muted) {
            c = color(this.colorMuted);
            alpha = 1;
            rand = color(250);
        } else {
            rand = color(0);
            if (aan && noot !== undefined) {
                // lage noot = rood, hoge noot = paars
                let kleurtoon: number = constrain(map(noot, 50, 90, 0, 300), 0, 300);
                colorMode(HSB, 360, 100, 100, 255);
                c = color(kleurtoon, 90, 100);
                colorMode(RGB, 255);
            } else if (aan) {
                c = color(this.colorAan);
            } else {
                c = color(this.colorUit);
            }
        }
        c.setAlpha(alpha * 255);

        this.huidigeKleur = lerpColor(this.huidigeKleur, c, this.lerpSnelheid);
        this.huidigeRand = lerpColor(this.huidigeRand, rand, this.lerpSnelheid);
        fill(this.huidigeKleur);
        stroke(this.huidigeRand);
    }
}