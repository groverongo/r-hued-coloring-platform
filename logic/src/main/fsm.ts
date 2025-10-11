import JSONEditor, { type JSONEditorOptions } from 'jsoneditor'
import Node from '../elements/node';
import Link from '../elements/link';
import SelfLink from '../elements/self_link';
import StartLink from '../elements/start_link';
import ExportAsSVG from '../export_as/svg';
import ExportAsLaTeX from '../export_as/latex';
import { Modal } from 'bootstrap';
import ExportAsJson from '../export_as/json';
import * as Toastify from 'toastify-js';

/* ADDED VARS */
let container: HTMLElement | null;
let editor: JSONEditor;
let options: JSONEditorOptions;


let in_panel = false;
let in_canvas = false;

let body_saved: string;


/* MODIFIED FUNCTIONS */
function drawUsing(c: CanvasRenderingContext2D) {
    c.clearRect(0, 0, canvas.width, canvas.height);
    c.save();
    c.translate(0.5, 0.5);
    let mode;

    for (let i = 0; i < nodes.length; i++) {
        c.lineWidth = 1;
        mode = (nodes[i] === selectedObject) ? 'focus' : 'normal';
        nodes[i].draw(c, mode);
    }
    for (let i = 0; i < links.length; i++) {
        c.lineWidth = 1;
        mode = (links[i] === selectedObject) ? 'focus' : 'normal';
        links[i].draw(c, mode);
    }
    if (currentLink != null) {
        c.lineWidth = 1;
        c.fillStyle = c.strokeStyle = 'black';
        currentLink.draw(c, mode);
    }

    c.restore();
}


export function stroke_theme_based(c: CanvasRenderingContext2D, mode: string) {
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


/*EDITOR PROPS*/

function create_json_editor() {
    // create the editor
    container = document.getElementById("jsoneditor")
    if(container === null) {
        console.error("Container not found")
        return
    }
    options = {
        mode: "tree", mainMenuBar: false, statusBar: false, enableSort: false, enableTransform: false
    }

    editor = new JSONEditor(container, options)
    container.setAttribute("style", `width:${400 * screenRatio}px`)

    // set json
    const initialJson = {
        "name": "exampleName",
        "outputs": {
            "output1": "string_val1",
            "output2": 2
        },
        "isAcceptState": false,

    }
    editor.set(initialJson)

    editor.expandAll()
}


function set_editor_content(json_content: any) {
    editor.set(json_content)
    editor.expandAll()
}


function get_editor_content(): any {
    return editor.get()
}

/* NEW FUNCTIONS */
function check_if_mobile_small() {
    if (screen.width <= 1200) {

        const styleTag = document.createElement('style');
        styleTag.textContent = "\n" +
            "/*======================\n" +
            "    404 page\n" +
            "=======================*/\n" +
            "\n" +
            "\n" +
            ".page_404{ padding:40px 0; background:#fff; font-family: 'Arvo', serif;\n" +
            "}\n" +
            "\n" +
            ".page_404  img{ width:100%;}\n" +
            "\n" +
            ".four_zero_four_bg{\n" +
            " \n" +
            " background-image: url(https://cdn.dribbble.com/users/285475/screenshots/2083086/dribbble_1.gif);\n" +
            "    height: 400px;\n" +
            "    background-position: center;\n" +
            " }\n" +
            " \n" +
            " \n" +
            " .four_zero_four_bg h1{\n" +
            " font-size:80px;\n" +
            " }\n" +
            " \n" +
            "  .four_zero_four_bg h3{\n" +
            "\t\t\t font-size:80px;\n" +
            "\t\t\t }\n" +
            "\t\t\t \n" +
            "\t\t\t .link_404{\t\t\t \n" +
            "\tcolor: #fff!important;\n" +
            "    padding: 10px 20px;\n" +
            "    background: #39ac31;\n" +
            "    margin: 20px 0;\n" +
            "    display: inline-block;}\n" +
            "\t.contant_box_404{ margin-top:-50px;}";

        document.head.appendChild(styleTag);

        if (body_saved === undefined)
            body_saved = document.body.innerHTML


        document.body.innerHTML = "<section class=\"page_404\">\n" +
            "\t<div class=\"container\">\n" +
            "\t\t<div class=\"row\">\t\n" +
            "\t\t<div class=\"col-sm-12 \">\n" +
            "\t\t<div class=\"col-sm-10 col-sm-offset-1  text-center\">\n" +
            "\t\t<div class=\"four_zero_four_bg\">\n" +
            "\t\t\t<h1 class=\"text-center \"></h1>\n" +
            "\t\t\n" +
            "\t\t\n" +
            "\t\t</div>\n" +
            "\t\t\n" +
            "\t\t<div class=\"contant_box_404\">\n" +
            "\t\t<h3 class=\"h2\">\n" +
            "\t\tMobiles and Tablets are not supported yet! We are open to your PRs\n" +
            "\t\t</h3>\n" +
            "\t\t\n" +
            "\t\t\n" +
            "\t</div>\n" +
            "\t\t</div>\n" +
            "\t\t</div>\n" +
            "\t\t</div>\n" +
            "\t</div>\n" +
            "</section>"

        return true
    } else {
        if (body_saved !== undefined) {
            document.body.innerHTML = body_saved;
            body_saved = undefined;
        }
        return false
    }
}

window.addEventListener("resize", check_if_mobile_small);


// Add a click event listener to the card
function init_uploader() {

    // Get a reference to the card element with file input
    const card = document.getElementById("json-container");
    if (!card) return;

// Get a reference to the hidden input element
    const jsonUpload = document.getElementById("json-upload");
    if (!jsonUpload) return;

    card.onclick = () => {
        jsonUpload.click();
    }

    jsonUpload.onchange = () => {

        const file = jsonUpload.files[0];
        if (file) {
            if (file.size > 10485760) {
                failedToast("Input file is too large 😱")
                return
            }
            // Check if the file name ends with ".json"
            if (file.name.endsWith(".json")) {

                // Read the file content as text
                const reader = new FileReader();
                reader.onload = function (event) {
                    const fileContent = event.target.result;

                    // Parse the JSON content
                    try {
                        const jsonObject = JSON.parse(fileContent);
                        restore(jsonObject)
                        draw()
                        successToast("Draw successfully 🤩")
                    } catch (error) {
                        failedToast("Error parsing the JSON 😥");
                    }
                };
                reader.readAsText(file);


            } else {
                // It's not a JSON file, log an error
                failedToast("Only Json file is supported 😬")
            }
            jsonUpload.value = null;
        }
    }
}

const uniqueId = () => {
    const dateString = Date.now().toString(36);
    const randomness = Math.random().toString(36).substr(2);
    return dateString + randomness;
};


/* CLEAR CANVAS PROP */
let confirmWindow; // bootstrap modal to get confirm of clear canvas action

function clear_canvas_confirm() {
    clear_canvas()
    confirmWindow.hide()
}

function clear_canvas_dismiss() {
    confirmWindow.hide()
}


function clear_canvas() {
    nodes.splice(0, nodes.length)
    links.splice(0, links.length)
    draw()


}

/*-------------------------------------------------------------*/


let greekLetterNames = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Kappa', 'Lambda', 'Mu', 'Nu', 'Xi', 'Omicron', 'Pi', 'Rho', 'Sigma', 'Tau', 'Upsilon', 'Phi', 'Chi', 'Psi', 'Omega'];

function convertLatexShortcuts(text: string) {
    // html greek characters
    for (let i = 0; i < greekLetterNames.length; i++) {
        let name = greekLetterNames[i];
        if (!name) continue;
        text = text.replace(new RegExp('\\\\' + name, 'g'), String.fromCharCode(913 + i + +(i > 16)));
        text = text.replace(new RegExp('\\\\' + name.toLowerCase(), 'g'), String.fromCharCode(945 + i + +(i > 16)));
    }

    // subscripts
    for (let i = 0; i < 10; i++) {
        text = text.replace(new RegExp('_' + i, 'g'), String.fromCharCode(8320 + i));
    }

    return text;
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

export function drawArrow(c: CanvasRenderingContext2D, x: number, y: number, angle: number) {
    let dx = Math.cos(angle);
    let dy = Math.sin(angle);
    c.beginPath();
    c.moveTo(x, y);
    c.lineTo(x - 8 * dx + 5 * dy, y - 8 * dy - 5 * dx);
    c.lineTo(x - 8 * dx - 5 * dy, y - 8 * dy + 5 * dx);
    c.fill();
}


function canvasHasFocus() {
    return in_canvas;
}

export function drawText(c: CanvasRenderingContext2D, originalText: string, x: number, y: number, angleOrNull: number | null, fontSize: number, isLink: boolean, isSelected: boolean) {
    c.font = `${fontSize}px "Times New Roman", serif`;


    let lines: string[] = originalText.split("\n")
    let max_width = 0
    for (let i = 0; i < lines.length; i++) {
        if (!lines[i]) continue;
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
        c.advancedFillText(convertLatexShortcuts(originalText), originalText, x + max_width / 2, y, angleOrNull);
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


        if (isSelected && caretVisible && canvasHasFocus() && document.hasFocus()) {
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

let caretTimer;
let caretVisible = true;

function resetCaret() {
    clearInterval(caretTimer);
    caretTimer = setInterval('caretVisible = !caretVisible; draw()', 500);
    caretVisible = true;
}

let theme = "light"
export let canvas;
let panel;
export let nodeRadius = 45;
export let fontSize = 20;
export let nodes: Node[] = [];
export let links: Link[] = [];
export let snapToPadding = 6; // pixels
export let hitTargetPadding = 6; // pixels
export let selectedObject: Node | Link | SelfLink | StartLink | null = null; // either a Link or a Node
let currentLink: Link | null = null; // a Link
let movingObject = false;
let originalClick: MouseEvent | null = null;
const screenRatio = screen.width / 2000


function draw() {
    if (in_canvas && (selectedObject instanceof Node || selectedObject instanceof Link || selectedObject instanceof SelfLink)) {
        set_editor_content(selectedObject.getJson())
    }


    drawUsing(canvas.getContext('2d'));
    saveBackup();
}

function selectObject(x: number, y: number) {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].containsPoint(x, y)) {
            return nodes[i];
        }
    }
    for (let i = 0; i < links.length; i++) {
        if (links[i].containsPoint(x, y)) {
            return links[i];
        }
    }
    return null;
}

function snapNode(node: Node) {
    for (let i = 0; i < nodes.length; i++) {
        if (nodes[i] === node) continue;

        if (Math.abs(node.x - nodes[i].x) < snapToPadding) {
            node.x = nodes[i].x;
        }

        if (Math.abs(node.y - nodes[i].y) < snapToPadding) {
            node.y = nodes[i].y;
        }
    }
}

window.onload = function () {

    if (check_if_mobile_small()) return;

    canvas = document.getElementById('canvas');
    panel = document.getElementById('panel');
    canvas.setAttribute("width", `${1200 * screen.width / 2000}px`);
    canvas.setAttribute("height", `${700}px`);
    panel.setAttribute("width", `${400 * screen.width / 2000}px`)

    confirmWindow = new Modal(document.getElementById('confirmWindow'),)
    create_json_editor();
    restore();
    draw();
    init_uploader()


    canvas.onmousedown = function (e) {
        const mouse = crossBrowserRelativeMousePos(e);
        in_canvas = true;

        // if selectedObject is not null than save the json of the editor into the node
        const json = get_editor_content()
        if (selectedObject != null && (selectedObject instanceof Node || selectedObject instanceof Link || selectedObject instanceof SelfLink)) {
            selectedObject.setJsonModel(json)
        }


        movingObject = false;
        originalClick = mouse;

        selectedObject = selectObject(mouse.x, mouse.y);
        if (selectedObject != null) {

            if (shift && selectedObject instanceof Node) {
                currentLink = new SelfLink(selectedObject, mouse);
            } else {
                movingObject = true;
                deltaMouseX = deltaMouseY = 0;
                if (selectedObject.setMouseStart) {
                    selectedObject.setMouseStart(mouse.x, mouse.y);
                }
            }
            resetCaret();
        } else if (shift) {
            currentLink = new TemporaryLink(mouse, mouse);
        }

        draw();

        if (canvasHasFocus()) {
            // disable drag-and-drop only if the canvas is already focused
            return false;
        } else {
            // otherwise, let the browser switch the focus away from wherever it was
            resetCaret();
            return true;
        }
    };

    canvas.ondblclick = function (e) {

        const mouse = crossBrowserRelativeMousePos(e);
        selectedObject = selectObject(mouse.x, mouse.y);

        if (selectedObject == null) {
            selectedObject = new Node(mouse.x, mouse.y);
            selectedObject.nodeId = uniqueId()
            nodes.push(selectedObject);
            resetCaret();
            draw();
        } else if (selectedObject instanceof Node) {
            selectedObject.isAcceptState = !selectedObject.isAcceptState;
            if (selectedObject.isAcceptState)
                draw();
        }
    };

    canvas.onmousemove = function (e) {
        const mouse = crossBrowserRelativeMousePos(e);


        if (currentLink != null) {
            let targetNode = selectObject(mouse.x, mouse.y);
            if (!(targetNode instanceof Node)) {
                targetNode = null;
            }

            if (selectedObject == null) {
                if (targetNode != null) {
                    currentLink = new StartLink(targetNode, originalClick);
                } else {
                    currentLink = new TemporaryLink(originalClick, mouse);
                }
            } else {
                if (targetNode === selectedObject) {
                    currentLink = new SelfLink(selectedObject, mouse);
                } else if (targetNode != null) {
                    currentLink = new Link(selectedObject, targetNode);
                } else {
                    currentLink = new TemporaryLink(selectedObject.closestPointOnCircle(mouse.x, mouse.y), mouse);
                }
            }
            draw();
        }

        if (movingObject) {
            selectedObject.setAnchorPoint(mouse.x, mouse.y);
            if (selectedObject instanceof Node) {
                snapNode(selectedObject);
            }
            draw();
        }
    };

    canvas.onmouseup = function (e) {
        movingObject = false;

        if (currentLink != null) {
            if (!(currentLink instanceof TemporaryLink)) {
                selectedObject = currentLink;
                currentLink.linkId = uniqueId()
                links.push(currentLink);
                resetCaret();
            }
            currentLink = null;
            draw();
        }
        shift = false
    };

    panel.onmousedown = function (e) {
        in_canvas = false;
        in_panel = true;
    }
}

let shift = false;

document.onkeydown = function (e) {
    const key = crossBrowserKey(e);

    if (e.shiftKey) {
        shift = true;
    } else if (!canvasHasFocus()) {
        // don't read keystrokes when other things have focus
        return true;
    } else if (key === "Backspace") { // backspace key
        if (selectedObject != null && 'text' in selectedObject) {
            selectedObject.text = selectedObject.text.substring(0, selectedObject.text.length - 1);
            resetCaret();
            draw();
            return true;
        }

        // backspace is a shortcut for the back button, but do NOT want to change pages
        return false;
    } else if (key === "Backspace" || key === "Delete") { // delete key
        if (selectedObject != null) {
            for (let i = 0; i < nodes.length; i++) {
                if (nodes[i] === selectedObject) {
                    nodes.splice(i--, 1);
                }
            }
            for (let i = 0; i < links.length; i++) {
                if (links[i] === selectedObject || links[i].node === selectedObject || links[i].nodeA === selectedObject || links[i].nodeB === selectedObject) {
                    links.splice(i--, 1);
                }
            }
            selectedObject = null;
            draw();
            return true;
        }
    }

    if (shift && key.includes("Arrow") && selectedObject) {
        if (key === "ArrowUp") {
            e.preventDefault()
            selectedObject.radius += 2.5
        }
        if (key === "ArrowDown") {
            e.preventDefault()
            selectedObject.radius -= 2
            selectedObject.radius = Math.max(selectedObject.radius, 0)
        }
        if (key === "ArrowRight") {
            e.preventDefault()
            selectedObject.fontSize += 2.5
        }
        if (key === "ArrowLeft") {
            e.preventDefault()
            selectedObject.fontSize -= 2
            selectedObject.fontSize = Math.max(selectedObject.fontSize, 0)
        }

        return true
    }

    if (shift && key === "L") {
        // open confirm modal
        confirmWindow.show()
    }

    if (!e.metaKey && !e.altKey && !e.ctrlKey && e.key !== "Tab" && selectedObject != null) {
        if (key === "Shift" && in_canvas) {
            return true
        }

        if (key === "Enter" && in_canvas) {
            selectedObject.text += "\n"
            resetCaret()
            draw()
            return true
        }
        if (key === " " && in_canvas) {
            e.preventDefault()
        }
        if (key.length === 1) {
            selectedObject.text += e.key
            resetCaret();
            draw();
            return true
        }
        return true
    }
};

document.onkeyup = function (e: KeyboardEvent) {
    if (e.shiftKey) {
        shift = false;
    }
};


function crossBrowserKey(e: KeyboardEvent) {
    return e.key;
}

function crossBrowserElementPos(e: MouseEvent) {
    let obj = e.target || e.srcElement;
    let x = 0, y = 0;
    while (obj.offsetParent) {
        x += obj.offsetLeft;
        y += obj.offsetTop;
        obj = obj.offsetParent;
    }
    return {'x': x, 'y': y};
}

function crossBrowserMousePos(e: MouseEvent) {
    return {
        'x': e.pageX || e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft,
        'y': e.pageY || e.clientY + document.body.scrollTop + document.documentElement.scrollTop,
    };
}

function crossBrowserRelativeMousePos(e) {
    const element = crossBrowserElementPos(e);
    const mouse = crossBrowserMousePos(e);
    return {
        'x': mouse.x - element.x,
        'y': mouse.y - element.y
    };
}

function output(text) {
    const element = document.getElementById('output');
    element.style.display = 'block';
    element.value = text;
}

function saveAsPNG() {
    canvas.toBlob(blob => {
        navigator.clipboard.write([new ClipboardItem({'image/png': blob})])
    })

    successToast("Copied to clipboard  \t\t😊")
}

function saveAsSVG() {
    let exporter = new ExportAsSVG();
    let oldSelectedObject = selectedObject;
    selectedObject = null;
    drawUsing(exporter);
    selectedObject = oldSelectedObject;
    let svgData = exporter.toSVG();
    output(svgData);
    // Chrome isn't ready for this yet, the 'Save As' menu item is disabled
    // document.location.href = 'data:image/svg+xml;base64,' + btoa(svgData);
}

function saveAsLaTeX() {
    let exporter = new ExportAsLaTeX();
    let oldSelectedObject = selectedObject;
    selectedObject = null;
    drawUsing(exporter);
    selectedObject = oldSelectedObject;
    let texData = exporter.toLaTeX();
    copyToClipboard(texData);
}

function saveAsJson() {
    return copyToClipboard(ExportAsJson())
}


function successToast(msg: string) {
    Toastify({
        text: msg,
        className: "info",
        duration: 3000,
        offset: {x: 50, y: 50},
        gravity: "top", // `top` or `bottom`
        position: "left", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
            height: "45px",
            width: "300px"
        },
        onClick: function () {
        } // Callback after click
    }).showToast();
}


function failedToast(msg: string) {
    Toastify({
        text: msg,
        className: "info",
        duration: 3000,
        offset: {x: 50, y: 50},
        gravity: "top", // `top` or `bottom`
        position: "left", // `left`, `center` or `right`
        stopOnFocus: true, // Prevents dismissing of toast on hover
        style: {
            background: "linear-gradient(to right, rgb(255, 95, 109), rgb(255, 195, 113))",
            height: "45px",
            width: "300px"
        },
        onClick: function () {
        } // Callback after click
    }).showToast();
}


async function copyToClipboard(textToCopy: string) {


    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(textToCopy);
            successToast("Copied to clipboard  \t\t😊")

        } else {
            // Use the 'out of viewport hidden text area' trick
            const textArea = document.createElement("textarea");
            textArea.value = textToCopy;

            // Move textarea out of the viewport, so it's not visible
            textArea.style.position = "absolute";
            textArea.style.left = "-999999px";

            document.body.appendChild(textArea);
            textArea.select();

            // Execute the copy command
            document.execCommand('copy');

            // Clean up
            document.body.removeChild(textArea);
        }
    } catch (error) {
        console.error(error);
    }
}
