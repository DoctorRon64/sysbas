export class Vierkant {
    constructor(x: number, y: number, size: number, colorAan: string, colorUit: string, colorMuted: string) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.colorAan = colorAan;
        this.colorUit = colorUit;
        this.colorMuted = colorMuted;
    }

    x: number;
    y: number;
    size: number;
    colorAan: string;
    colorUit: string;
    colorMuted: string;
    muted: boolean = false;

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

    select(mx: number, my: number): boolean {
        // mouseX/mouseY beginnen linksboven, WEBGL-coördinaten in het midden
        let dx: number = mx - width / 2 - this.x;
        let dy: number = my - height / 2 - this.y;
        return abs(dx) <= this.size / 2 && abs(dy) <= this.size / 2;
    }

    color(aan: boolean, alpha: number = 1, noot?: number) {
        let c: ReturnType<typeof color>;
        if (this.muted) {
            c = color(this.colorMuted);
            alpha = 1;
        } else if (aan && noot !== undefined) {
            // lage noot = rood, hoge noot = paars
            let kleurtoon: number = constrain(map(noot, 45, 81, 0, 300), 0, 300);
            colorMode(HSB, 360, 100, 100, 255);
            c = color(kleurtoon, 90, 100);
            colorMode(RGB, 255);
        } else if (aan) {
            c = color(this.colorAan);
        } else {
            c = color(this.colorUit);
        }
        c.setAlpha(alpha * 255);
        fill(c);
    }
}