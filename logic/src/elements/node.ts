import { drawText, fontSize, nodeRadius, selectedObject, stroke_theme_based } from "../main/fsm";

export default class Node {
    x: number;
    y: number;
    mouseOffsetX: number;
    mouseOffsetY: number;
    isAcceptState: boolean;
    text: string;
    outputs: any;
    radius: number;
    fontSize: number;
    nodeId: string | null;
    json_model: any;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.mouseOffsetX = 0;
        this.mouseOffsetY = 0;
        this.isAcceptState = false;
        this.text = '';
        this.outputs = {}
        this.radius = nodeRadius
        this.fontSize = fontSize
        this.nodeId = null

        this.json_model = {};
    }

    getJson() {
        if (!this.isAcceptState) {
            if (this.json_model["outputs"]) {
                return {...this.json_model, "name": this.text, "isAcceptState": false}
            } else {
                return {...this.json_model, "name": this.text, "outputs": this.outputs, "isAcceptState": false}
            }
        } else {
            if (this.json_model["outputs"]) {
                return {...this.json_model, "name": this.text, "isAcceptState": true}
            } else {
                return {...this.json_model, "name": this.text, "outputs": this.outputs, "isAcceptState": true}
            }
        }
    }

    setJsonModel(json: any) {
        if (json.hasOwnProperty('outputs')) {
            this.outputs = json.outputs;
        }
        if (json.hasOwnProperty('name')) {
            this.text = json.name
        }
        if (json.hasOwnProperty('isAcceptState')) {
            this.isAcceptState = json.isAcceptState
        }
    
        this.json_model = json
    }

    setMouseStart(x: number, y: number) {
        this.mouseOffsetX = this.x - x;
        this.mouseOffsetY = this.y - y;
    }

    setAnchorPoint(x: number, y: number) {
        this.x = x + this.mouseOffsetX;
        this.y = y + this.mouseOffsetY;
    }

    draw(c: CanvasRenderingContext2D, mode: string) {
        // draw the circle
        c.beginPath();
        c.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        stroke_theme_based(c, mode)
    
        // draw the text
        drawText(c, this.text, this.x, this.y, null, this.fontSize, false, selectedObject === this);
    
        // draw a double circle for an accept state
        if (this.isAcceptState) {
            c.beginPath();
            c.arc(this.x, this.y, this.radius - 6, 0, 2 * Math.PI, false);
            stroke_theme_based(c, mode)
        }
    };

    closestPointOnCircle(x: number, y: number) {
        const dx = x - this.x;
        const dy = y - this.y;
        const scale = Math.sqrt(dx * dx + dy * dy);
        return {
            'x': this.x + dx * this.radius / scale,
            'y': this.y + dy * this.radius / scale,
        };
    };

    containsPoint(x: number, y: number) {
        return (x - this.x) * (x - this.x) + (y - this.y) * (y - this.y) < this.radius * this.radius;
    };   
}