import { drawArrow, stroke_theme_based } from "../main/fsm";
import type Node from "./node";

export class TemporaryLink {
    from: Node;
    to: Node;
    constructor(from: Node, to: Node) {
        this.from = from;
        this.to = to;
    }
    draw(c: CanvasRenderingContext2D) {
        // draw the line
        c.beginPath();
        c.moveTo(this.to.x, this.to.y);
        c.lineTo(this.from.x, this.from.y);
        stroke_theme_based(c, "normal")
    
    
        // draw the head of the arrow
        drawArrow(c, this.to.x, this.to.y, Math.atan2(this.to.y - this.from.y, this.to.x - this.from.x));
    };
}

