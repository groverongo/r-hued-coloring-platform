import { MouseEvent } from "react";
import { GREEK_LETTER_NAMES } from "./constant";
import { CurrentLinkType, LinksType, SelectedObjectType } from "./types";
import NodeC from "@/classes/node";
import SelfLink from "@/classes/self_link";
import LinkC from "@/classes/link";
import StartLink from "@/classes/start_link";

export const uniqueId = () => {
    const dateString = Date.now().toString(36);
    const randomness = Math.random().toString(36).slice(2);
    return `${dateString}_${randomness}`;
};

export const isIntString = (str: string): boolean => {
    const num = Number(str);
    return !isNaN(num) && Number.isInteger(num);
}

export function crossBrowserElementPos(e: MouseEvent) {
    let obj = e.target;
    let x = 0, y = 0;

    // while (obj !== null && obj instanceof HTMLElement && obj.offsetParent) {
    while (obj !== null && obj instanceof HTMLElement && obj.offsetParent) {
        x += obj.offsetLeft;
        y += obj.offsetTop;
        obj = obj.offsetParent as HTMLElement;
    }

    return {x, y};
}

export function crossBrowserMousePos(e: MouseEvent) {
    return {
        'x': e.pageX || e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
        'y': e.pageY || e.clientY + document.body.scrollTop + document.documentElement.scrollTop,
    };
}

export function crossBrowserRelativeMousePos(e: MouseEvent) {
    const element = crossBrowserElementPos(e);
    const mouse = crossBrowserMousePos(e);
    return {
        'x': mouse.x - element.x,
        'y': mouse.y - element.y
    };
}

export function strokeThemeBased(c: CanvasRenderingContext2D, mode: string, theme: string) {
    if (theme === "dark") {
        if (mode === "normal") {
            c.strokeStyle = "white"
            c.fillStyle = "white"
        } else {
            c.strokeStyle = "#e59c24"
            c.fillStyle = "#e59c24"
        }
    } else {
        if (mode === "normal") {
            c.strokeStyle = "black"
            c.fillStyle = "black"
        } else {
            c.strokeStyle = "#1fc493"
            c.fillStyle = "#1fc493"
        }
    }
    c.stroke();
}

function convertLatexShortcuts(text: string) {
    // html greek characters
    GREEK_LETTER_NAMES.forEach((name, i) => {
        text = text.replace(new RegExp('\\\\' + name, 'g'), String.fromCharCode(913 + i + +(i > 16)));
        text = text.replace(new RegExp('\\\\' + name.toLowerCase(), 'g'), String.fromCharCode(945 + i + +(i > 16)));
    })

    // subscripts
    for (let i = 0; i < 10; i++) {
        text = text.replace(new RegExp('_' + i, 'g'), String.fromCharCode(8320 + i));
    }

    return text;
}

export function drawText(c: CanvasRenderingContext2D, originalText: string, x: number, y: number, angleOrNull: number | null, fontSize: number, isLink: boolean, isSelected: boolean, caretVisible: boolean, inCanvas: boolean) {
    c.font = `${fontSize}px "Times New Roman", serif`;


    let lines = originalText.split("\n")
    let max_width = 0
    for (let i = 0; i < lines.length; i++) {
        lines[i] = convertLatexShortcuts(lines[i])
        let width = c.measureText(lines[i]).width
        if (width > max_width) max_width = width
    }

    // center the text
    let x_c = x
    x -= max_width / 2;


    // position the text intelligently if given an angle
    if (angleOrNull != null) {
        let cos = Math.cos(angleOrNull);
        let sin = Math.sin(angleOrNull);
        let cornerPointX = (max_width / 2 + 5) * (cos > 0 ? 1 : -1);
        let cornerPointY = (10 + 5) * (sin > 0 ? 1 : -1);
        let slide = sin * Math.pow(Math.abs(sin), 40) * cornerPointX - cos * Math.pow(Math.abs(cos), 10) * cornerPointY;
        x += cornerPointX - sin * slide;
        y += cornerPointY + cos * slide;
    }

    // draw text and caret (round the coordinates so the caret falls on a pixel)
    if ('advancedFillText' in c) {
        (c as any).advancedFillText(convertLatexShortcuts(originalText), originalText, x + max_width / 2, y, angleOrNull);
    } else {
        if (isLink) {
            x = Math.round(x);
            y = Math.round(y);
            c.fillText(convertLatexShortcuts(originalText), x, y + 6);
        } else {
            y = Math.round(y) - (lines.length - 1) * fontSize / 2;
            let dx
            for (let i = 0; i < lines.length; i++) {
                dx = Math.round(c.measureText(lines[i]).width);
                c.fillText(lines[i], x_c - dx / 2, y + 6 + i * fontSize)
            }
        }


        if (isSelected && caretVisible && inCanvas && document.hasFocus()) {
            if (isLink) {
                x += max_width;
                c.beginPath();
                c.moveTo(x, y - fontSize / 2);
                c.lineTo(x, y + fontSize / 2);
                c.stroke();
            } else {
                x += max_width / 2
                x += c.measureText(lines[lines.length - 1]).width / 2
                c.beginPath();
                c.moveTo(x, y + (fontSize * (lines.length - 1)) + fontSize / 2);
                c.lineTo(x, y + (fontSize * (lines.length - 1)) - fontSize / 2);
                c.stroke();
            }
        }
    }
}

export function textToXML(text: string) {
    text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    let result = '';
    for (let i = 0; i < text.length; i++) {
        let c = text.charCodeAt(i);
        if (c >= 0x20 && c <= 0x7E) {
            result += text[i];
        } else {
            result += '&#' + c + ';';
        }
    }
    return result;
}


function setEditorContent(jsonContent: any, setJsonEditor: ((data: unknown) => void)){
    setJsonEditor(jsonContent)
}


function clearCanvas(setNodes: ((data: unknown) => void), setLinks: ((data: unknown) => void), canvas: HTMLCanvasElement, c: CanvasRenderingContext2D, nodes: NodeC[], links: LinksType[], currentLink: CurrentLinkType, theme: string, selectedObject: SelectedObjectType, caretVisible: boolean, inCanvas: boolean, setJsonEditor: ((data: unknown) => void)) {
    setNodes([])
    setLinks([])
    draw(canvas, c, nodes, links, currentLink, theme, selectedObject, caretVisible, inCanvas, setJsonEditor);
}

export function draw(canvas: HTMLCanvasElement, c: CanvasRenderingContext2D, nodes: NodeC[], links: LinksType[], currentLink: CurrentLinkType, theme: string, selectedObject: SelectedObjectType, caretVisible: boolean, inCanvas: boolean, setJsonEditor: ((data: any) => void)) {
    console.log("DRAW FUNCTION", selectedObject)
    if (inCanvas && selectedObject instanceof NodeC) {
        setEditorContent(selectedObject.getJson(), setJsonEditor)
    } else if(inCanvas && selectedObject instanceof LinkC) {
        setEditorContent(selectedObject.getJson(), setJsonEditor)
    } else if(inCanvas && selectedObject instanceof SelfLink) {
        setEditorContent(selectedObject.getJson(), setJsonEditor)
    }
    
    
    drawUsing(canvas, c, nodes, links, currentLink, theme, selectedObject, caretVisible, inCanvas);
    saveBackup(nodes, links);
    console.log("DRAW FUNCTION END", canvas, c, "@")
}

function drawUsing(canvas: HTMLCanvasElement, c: CanvasRenderingContext2D, nodes: NodeC[], links: LinksType[], currentLink: CurrentLinkType, theme: string, selectedObject: SelectedObjectType, caretVisible: boolean, inCanvas: boolean) {
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.save();
    c.translate(0.5, 0.5);
    let mode = "light";

    for (let i = 0; i < nodes.length; i++) {
        c.lineWidth = 1;
        mode = (nodes[i] === selectedObject) ? 'focus' : 'normal';
        nodes[i].draw(c, mode, theme, selectedObject, caretVisible, inCanvas);
    }
    for (let i = 0; i < links.length; i++) {
        c.lineWidth = 1;
        mode = (links[i] === selectedObject) ? 'focus' : 'normal';
        links[i].draw(c, mode, theme, selectedObject, caretVisible, inCanvas);
    }
    if (currentLink != null) {
        c.lineWidth = 1;
        c.fillStyle = c.strokeStyle = 'black';
        currentLink.draw(c, mode, theme, selectedObject, caretVisible, inCanvas);
    }

    c.restore();
}

function saveBackup(nodes: NodeC[], links: LinksType[]) {
    if (!localStorage || !JSON) {
        return;
    }

    const backup = {
        'nodes': [] as any[],
        'links': [] as any[],
    };
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const backupNode = {
            'x': node.x,
            'y': node.y,
            'radius': node.radius,
            'text': node.text,
            'isAcceptState': node.isAcceptState,
            'json_model': JSON.stringify(node.json_model),
            'fontSize': node.fontSize,
            'nodeId': node.nodeId
        };
        backup.nodes.push(backupNode);
    }
    for (let i = 0; i < links.length; i++) {
        const link = links[i];
        let backupLink = null;
        if (link instanceof SelfLink) {
            backupLink = {
                'type': 'SelfLink',
                'node': nodes.indexOf(link.node),
                'text': link.text,
                'anchorAngle': link.anchorAngle,
                'json_model': JSON.stringify(link.json_model),
                'linkId': link.linkId,
                'fontSize': link.fontSize,
            };
        } else if (link instanceof StartLink) {
            backupLink = {
                'type': 'StartLink',
                'node': nodes.indexOf(link.node),
                'text': link.text,
                'deltaX': link.deltaX,
                'deltaY': link.deltaY,
                'linkId': link.linkId
            };
        } else if (link instanceof LinkC) {
            backupLink = {
                'type': 'Link',
                'nodeA': nodes.indexOf(link.nodeA),
                'nodeB': nodes.indexOf(link.nodeB),
                'json_model': JSON.stringify(link.json_model),
                'fontSize': link.fontSize,
                'text': link.text,
                'lineAngleAdjust': link.lineAngleAdjust,
                'parallelPart': link.parallelPart,
                'perpendicularPart': link.perpendicularPart,
                'linkId': link.linkId
            };
        }
        if (backupLink != null) {
            backup.links.push(backupLink);
        }
    }

    localStorage['fsm'] = JSON.stringify(backup);
}