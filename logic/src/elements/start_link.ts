import { drawArrow, drawText, fontSize, hitTargetPadding, selectedObject, snapToPadding, stroke_theme_based } from "../main/fsm";
import Node from "./node";

export default class StartLink {
    node: Node;
    deltaX: number;
    deltaY: number;
    text: string;
    linkId: string | null;
    fontSize: number;
    outputs: any;

    constructor(node: Node, start: MouseEvent) {
        this.node = node;
        this.deltaX = 0;
        this.deltaY = 0;
        this.text = '';
        this.linkId = null
        this.fontSize = fontSize

        this.outputs = {};

        if (start) {
            this.setAnchorPoint(start.x, start.y);
        }
    }

    setAnchorPoint(x: number, y: number) {
        this.deltaX = x - this.node.x;
        this.deltaY = y - this.node.y;
    
        if (Math.abs(this.deltaX) < snapToPadding) {
            this.deltaX = 0;
        }
    
        if (Math.abs(this.deltaY) < snapToPadding) {
            this.deltaY = 0;
        }
    };
    
    getEndPoints () {
        var startX = this.node.x + this.deltaX;
        var startY = this.node.y + this.deltaY;
        var end = this.node.closestPointOnCircle(startX, startY);
        return {
            'startX': startX,
            'startY': startY,
            'endX': end.x,
            'endY': end.y,
        };
    };
    
    draw(c: CanvasRenderingContext2D) {
        const stuff = this.getEndPoints();
    
        // draw the line
        c.beginPath();
        c.moveTo(stuff.startX, stuff.startY);
        c.lineTo(stuff.endX, stuff.endY);
        stroke_theme_based(c, "normal")
    
    
        // draw the text at the end without the arrow
        const textAngle = Math.atan2(stuff.startY - stuff.endY, stuff.startX - stuff.endX);
        drawText(c, this.text, stuff.startX, stuff.startY, textAngle, this.fontSize, true, selectedObject === this);
    
        // draw the head of the arrow
        drawArrow(c, stuff.endX, stuff.endY, Math.atan2(-this.deltaY, -this.deltaX));
    };
    
    containsPoint(x: number, y: number) {
        const stuff = this.getEndPoints();
        const dx = stuff.endX - stuff.startX;
        const dy = stuff.endY - stuff.startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const percent = (dx * (x - stuff.startX) + dy * (y - stuff.startY)) / (length * length);
        const distance = (dx * (y - stuff.startY) - dy * (x - stuff.startX)) / length;
        return (percent > 0 && percent < 1 && Math.abs(distance) < hitTargetPadding);
    };
    
}

