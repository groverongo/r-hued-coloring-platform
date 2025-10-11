import { drawArrow, drawText, fontSize, hitTargetPadding, selectedObject, snapToPadding, stroke_theme_based } from "../main/fsm";
import { circleFromThreePoints } from "../main/math";
import type Node from "./node";

export default class Link {
    nodeA: Node;
    nodeB: Node;
    text: string;
    linkId: string | null;
    lineAngleAdjust: number;
    parallelPart: number;
    perpendicularPart: number;
    fontSize: number;
    json_model: any;

    constructor(a: Node, b: Node) {
        this.nodeA = a;
        this.nodeB = b;
        this.text = '';
        this.linkId = null;
        this.lineAngleAdjust = 0; // value to add to textAngle when link is straight line

        // make anchor point relative to the locations of nodeA and nodeB
        this.parallelPart = 0.5; // percentage from nodeA to nodeB
        this.perpendicularPart = 0; // pixels from line between nodeA and nodeB

        this.fontSize = fontSize;
        this.json_model = {};
    }

    setJsonModel(json: any) {
        if (json.hasOwnProperty('name')) {
            this.text = json.name
        }

        this.json_model = json
    }

    getJson() {
        // return json obj based on this.txt and this.output
        return {...this.json_model, "name": this.text}
    }

    getAnchorPoint() {
        // compute distance between two nodes
        const dx = this.nodeB.x - this.nodeA.x;
        const dy = this.nodeB.y - this.nodeA.y;
        const scale = Math.sqrt(dx * dx + dy * dy);

        return {
            'x': this.nodeA.x + dx * this.parallelPart - dy * this.perpendicularPart / scale,
            'y': this.nodeA.y + dy * this.parallelPart + dx * this.perpendicularPart / scale
        };
    }

    setAnchorPoint(x: number, y: number) {
        const dx = this.nodeB.x - this.nodeA.x;
        const dy = this.nodeB.y - this.nodeA.y;
        const scale = Math.sqrt(dx * dx + dy * dy);
        this.parallelPart = (dx * (x - this.nodeA.x) + dy * (y - this.nodeA.y)) / (scale * scale);
        this.perpendicularPart = (dx * (y - this.nodeA.y) - dy * (x - this.nodeA.x)) / scale;
        // snap to a straight line
        if (this.parallelPart > 0 && this.parallelPart < 1 && Math.abs(this.perpendicularPart) < snapToPadding) {
            this.lineAngleAdjust = +(this.perpendicularPart < 0) * Math.PI;
            this.perpendicularPart = 0;
        }
    }
    
    getEndPointsAndCircle() {
        if (this.perpendicularPart === 0) {
            const midX = (this.nodeA.x + this.nodeB.x) / 2;
            const midY = (this.nodeA.y + this.nodeB.y) / 2;
            const start = this.nodeA.closestPointOnCircle(midX, midY);
            const end = this.nodeB.closestPointOnCircle(midX, midY);
            return {
                'hasCircle': false,
                'startX': start.x,
                'startY': start.y,
                'endX': end.x,
                'endY': end.y,
            };
        }
        const anchor = this.getAnchorPoint();
        const circle = circleFromThreePoints(this.nodeA.x, this.nodeA.y, this.nodeB.x, this.nodeB.y, anchor.x, anchor.y);
        const isReversed = (this.perpendicularPart > 0);
        const reverseScale = isReversed ? 1 : -1;
        const startAngle = Math.atan2(this.nodeA.y - circle.y, this.nodeA.x - circle.x) - reverseScale * this.nodeA.radius / circle.radius;
        const endAngle = Math.atan2(this.nodeB.y - circle.y, this.nodeB.x - circle.x) + reverseScale * this.nodeB.radius / circle.radius;
        const startX = circle.x + circle.radius * Math.cos(startAngle);
        const startY = circle.y + circle.radius * Math.sin(startAngle);
        const endX = circle.x + circle.radius * Math.cos(endAngle);
        const endY = circle.y + circle.radius * Math.sin(endAngle);
        return {
            'hasCircle': true,
            'startX': startX,
            'startY': startY,
            'endX': endX,
            'endY': endY,
            'startAngle': startAngle,
            'endAngle': endAngle,
            'circleX': circle.x,
            'circleY': circle.y,
            'circleRadius': circle.radius,
            'reverseScale': reverseScale,
            'isReversed': isReversed,
        };
    };

    draw(c: CanvasRenderingContext2D, color: string) {
        const stuff = this.getEndPointsAndCircle();
        // draw arc
        c.beginPath();
        if (stuff.hasCircle) {
            if(stuff.circleX === undefined || stuff.circleY === undefined || stuff.circleRadius === undefined || stuff.startAngle === undefined || stuff.endAngle === undefined) {
                console.error("Circle properties are undefined")
                return
            }
            c.arc(stuff.circleX, stuff.circleY, stuff.circleRadius, stuff.startAngle, stuff.endAngle, stuff.isReversed);
        } else {
            c.moveTo(stuff.startX, stuff.startY);
            c.lineTo(stuff.endX, stuff.endY);
        }
    
        // set color of stroke to white
        stroke_theme_based(c, color);
    
        // draw the head of the arrow
        if (stuff.hasCircle) {
            if(stuff.endAngle === undefined || stuff.reverseScale === undefined) {
                console.error("End angle or reverse scale is undefined")
                return
            }
            drawArrow(c, stuff.endX, stuff.endY, stuff.endAngle - stuff.reverseScale * (Math.PI / 2));
        } else {
            drawArrow(c, stuff.endX, stuff.endY, Math.atan2(stuff.endY - stuff.startY, stuff.endX - stuff.startX));
        }
        // draw the text
        if (stuff.hasCircle) {
            const startAngle = stuff.startAngle;
            if(startAngle === undefined) {
                console.error("Start angle is undefined")
                return
            }
            let endAngle = stuff.endAngle;
            if (endAngle < startAngle) {
                endAngle += Math.PI * 2;
            }
            const textAngle = (startAngle + endAngle) / 2 + (+stuff.isReversed) * Math.PI;
            const textX = stuff.circleX + stuff.circleRadius * Math.cos(textAngle);
            const textY = stuff.circleY + stuff.circleRadius * Math.sin(textAngle);
            drawText(c, this.text, textX, textY, textAngle, this.fontSize, true, selectedObject === this);
        } else {
            const textX = (stuff.startX + stuff.endX) / 2;
            const textY = (stuff.startY + stuff.endY) / 2;
            const textAngle = Math.atan2(stuff.endX - stuff.startX, stuff.startY - stuff.endY);
            drawText(c, this.text, textX, textY, textAngle + this.lineAngleAdjust, this.fontSize, true, selectedObject === this);
        }
    };

    containsPoint (x: number, y: number) {
        var stuff = this.getEndPointsAndCircle();
        if (stuff.hasCircle && stuff.circleX !== undefined && stuff.circleY !== undefined && stuff.circleRadius !== undefined) {
            var dx = x - stuff.circleX;
            var dy = y - stuff.circleY;
            var distance = Math.sqrt(dx * dx + dy * dy) - stuff.circleRadius;
            if (Math.abs(distance) < hitTargetPadding) {
                var angle = Math.atan2(dy, dx);
                var startAngle = stuff.startAngle;
                var endAngle = stuff.endAngle;
                if (stuff.isReversed) {
                    var temp = startAngle;
                    startAngle = endAngle;
                    endAngle = temp;
                }
                if (endAngle < startAngle) {
                    endAngle += Math.PI * 2;
                }
                if (angle < startAngle) {
                    angle += Math.PI * 2;
                } else if (angle > endAngle) {
                    angle -= Math.PI * 2;
                }
                return (angle > startAngle && angle < endAngle);
            }
        } else {
            var dx = stuff.endX - stuff.startX;
            var dy = stuff.endY - stuff.startY;
            var length = Math.sqrt(dx * dx + dy * dy);
            var percent = (dx * (x - stuff.startX) + dy * (y - stuff.startY)) / (length * length);
            var distance = (dx * (y - stuff.startY) - dy * (x - stuff.startX)) / length;
            return (percent > 0 && percent < 1 && Math.abs(distance) < hitTargetPadding);
        }
        return false;
    };
}

