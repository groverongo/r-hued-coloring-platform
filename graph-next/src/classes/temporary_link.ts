import { strokeThemeBased } from "@/common/utilities";
import type NodeC from "./node";

export class TemporaryLink {
    from: NodeC;
    to: NodeC;
    constructor(from: NodeC, to: NodeC) {
        this.from = from;
        this.to = to;
    }
    draw(c: CanvasRenderingContext2D, theme: string) {
        // draw the line
        c.beginPath();
        c.moveTo(this.to.x, this.to.y);
        c.lineTo(this.from.x, this.from.y);
        strokeThemeBased(c, "normal", theme)
    
    
        // draw the head of the arrow
        // drawArrow(c, this.to.x, this.to.y, Math.atan2(this.to.y - this.from.y, this.to.x - this.from.x));
    };

    setAnchorPoint(...args: any[]){
        console.info(NOT_IN_IMPLEMENTATION);
    }
    
}

