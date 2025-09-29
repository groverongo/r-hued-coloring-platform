import { FONT_SIZE, HIT_TARGET_PADDING, SNAP_TO_PADDING } from "@/common/constant";
import NodeC from "./node";
import { strokeThemeBased } from "@/common/utilities";

export default class StartLink {
    node: NodeC;
    deltaX: number;
    deltaY: number;
    text: string;
    linkId: string | null;
    fontSize: number;
    outputs: any;

    // constructor(node: NodeC, start: MouseEvent) {
    constructor(node: NodeC, start: {x: number, y: number}) {
        this.node = node;
        this.deltaX = 0;
        this.deltaY = 0;
        this.text = '';
        this.linkId = null
        this.fontSize = FONT_SIZE

        this.outputs = {};

        if (start) {
            this.setAnchorPoint(start.x, start.y);
        }
    }

    setAnchorPoint(x: number, y: number) {
        this.deltaX = x - this.node.x;
        this.deltaY = y - this.node.y;
    
        if (Math.abs(this.deltaX) < SNAP_TO_PADDING) {
            this.deltaX = 0;
        }
    
        if (Math.abs(this.deltaY) < SNAP_TO_PADDING) {
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
    
    draw(c: CanvasRenderingContext2D, theme: string) {
        const stuff = this.getEndPoints();
    
        // draw the line
        c.beginPath();
        c.moveTo(stuff.startX, stuff.startY);
        c.lineTo(stuff.endX, stuff.endY);
        strokeThemeBased(c, "normal", theme)
    
    
        // draw the text at the end without the arrow
        // const textAngle = Math.atan2(stuff.startY - stuff.endY, stuff.startX - stuff.endX);
        // drawText(c, this.text, stuff.startX, stuff.startY, textAngle, this.fontSize, true, selectedObject === this);
    
        // draw the head of the arrow
        // drawArrow(c, stuff.endX, stuff.endY, Math.atan2(-this.deltaY, -this.deltaX));
    };
    
    containsPoint(x: number, y: number) {
        const stuff = this.getEndPoints();
        const dx = stuff.endX - stuff.startX;
        const dy = stuff.endY - stuff.startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const percent = (dx * (x - stuff.startX) + dy * (y - stuff.startY)) / (length * length);
        const distance = (dx * (y - stuff.startY) - dy * (x - stuff.startX)) / length;
        return (percent > 0 && percent < 1 && Math.abs(distance) < HIT_TARGET_PADDING);
    };

    
}

