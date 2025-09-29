import Link from "@/classes/link";
import NodeC from "@/classes/node";
import SelfLink from "@/classes/self_link";
import StartLink from "@/classes/start_link";
import { TemporaryLink } from "@/classes/temporary_link";
import { caretTimerAtom, caretVisibleAtom, currentLinkAtom, inCanvasAtom, jsonEditorAtom, linksAtom, movingObjectAtom, nodesAtom, originalClickAtom, selectedObjectAtom, shiftAtom, themeAtom } from "@/common/atoms";
import { SNAP_TO_PADDING } from "@/common/constant";
import { CANVAS_ACTIONS, CANVAS_CONDITIONS } from "@/common/messages";
import { useCanvasRef } from "@/common/refs";
import { crossBrowserRelativeMousePos, draw, uniqueId } from "@/common/utilities";
import { useAtom, useAtomValue } from "jotai";
import { useSetAtom } from "jotai";
import { CSSProperties, MouseEventHandler, useEffect, useRef, useState } from "react";

export default function Canvas(){

    const canvasRef = useCanvasRef();
    const [selectedObject, setSelectedObject] = useAtom(selectedObjectAtom);
    const [nodes, setNodes] = useAtom(nodesAtom);
    const links = useAtomValue(linksAtom);
    const [currentLink, setCurrentLink] = useAtom(currentLinkAtom)
    const originalClick = useAtomValue(originalClickAtom)
    const [movingObject, setMovingObject] = useAtom(movingObjectAtom);
    const editor = useAtomValue(jsonEditorAtom);
    const setInCanvas = useSetAtom(inCanvasAtom);
    const setOriginalClick = useSetAtom(originalClickAtom);
    const [valueLinks, setLinks] = useAtom(linksAtom);
    const [shift, setShift] = useAtom(shiftAtom)
    const inCanvas = useAtomValue(inCanvasAtom);
    const [caretTimer, setCaretTimer] = useAtom(caretTimerAtom);
    const [caretVisible, setCaretVisible] = useAtom(caretVisibleAtom);
    const theme = useAtomValue(themeAtom);
    const setJsonEditor = useSetAtom(jsonEditorAtom);
    const styleProps = useRef<CSSProperties>({});

    const deltaMouseX = useRef<number>(null);
    const deltaMouseY = useRef<number>(null);

    useEffect(() => {
        styleProps.current = {
            height: `${700}px`,
            width: `${1200 * screen.width / 2000}px`,
        }
    }, []);

    useEffect(() => {
        return () => {
            if (caretTimer) clearInterval(caretTimer);
        };
    }, [caretTimer]);

    function resetCaret() {

        const handler: Function = () => {
            const canvas = canvasRef.current;
            if(canvas === null) return;
            const context = canvas.getContext("2d");
            if(context === null) return;
            setCaretVisible(!caretVisible);
            draw(canvas, context, nodes, links, currentLink, theme, selectedObject, caretVisible, inCanvas, setJsonEditor);
        }

        clearInterval(caretTimer);

        setCaretTimer(setInterval(handler, 500));
        
        setCaretVisible(true);
    }

    function selectObject(x: number, y: number) {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].containsPoint(x, y)) {
                return nodes[i];
            }
        }
        for (let i = 0; i < links.length; i++) {
            const l = links[i];
            if(!(l instanceof TemporaryLink) && l.containsPoint(x,y)){
                return l;
            }
        }
        return null;
    }

    function snapNode(node: NodeC) {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i] === node) continue;

            if (Math.abs(node.x - nodes[i].x) < SNAP_TO_PADDING) {
                node.x = nodes[i].x;
            }

            if (Math.abs(node.y - nodes[i].y) < SNAP_TO_PADDING) {
                node.y = nodes[i].y;
            }
        }

        return node;
    }

    const onMouseDown: MouseEventHandler<HTMLCanvasElement> = (e) => {

        console.log(CANVAS_ACTIONS.MOUSE_DOWN.start);

        const canvas = canvasRef.current;
        if(canvas === null) {
            console.log(CANVAS_CONDITIONS.MISSING_CANVAS_REF)
            console.log(CANVAS_ACTIONS.MOUSE_DOWN.end);
            return;
        }
        const context = canvas.getContext('2d');
        if(context === null) {
            console.log(CANVAS_CONDITIONS.MISSING_CANVAS_CONTEXT)
            console.log(CANVAS_ACTIONS.MOUSE_DOWN.end);
            return;
        }

        const mouse = crossBrowserRelativeMousePos(e);
        setInCanvas(true);

        // if selectedObject is not null than save the json of the editor into the node
        const json = editor;
        if (selectedObject != null && (selectedObject instanceof NodeC || selectedObject instanceof Link || selectedObject instanceof SelfLink)) {
            selectedObject.setJsonModel(json)
        }


        setMovingObject(false);
        setOriginalClick(mouse);

        setSelectedObject(selectObject(mouse.x, mouse.y));
        if (selectedObject != null) {

            if (shift && selectedObject instanceof NodeC) {
                setCurrentLink(new SelfLink(selectedObject, mouse));
            } else {
                setMovingObject(true);
                deltaMouseX.current = deltaMouseY.current = 0;
                if (selectedObject instanceof NodeC ) {
                    selectedObject.setMouseStart(mouse.x, mouse.y);
                } else if (selectedObject instanceof SelfLink ) {
                    selectedObject.setMouseStart(mouse.x, mouse.y);
                } 
            }
            resetCaret();
        } else if (shift) {
            setCurrentLink(new TemporaryLink(new NodeC(mouse.x, mouse.y), new NodeC(mouse.x, mouse.y)));
        }

        draw(canvas, context, nodes, links, currentLink, theme, selectedObject, caretVisible, inCanvas, setJsonEditor);

        if (inCanvas) {
            // disable drag-and-drop only if the canvas is already focused
            console.log(CANVAS_ACTIONS.MOUSE_DOWN.end);
            return false;
        } else {
            // otherwise, let the browser switch the focus away from wherever it was
            resetCaret();
            console.log(CANVAS_ACTIONS.MOUSE_DOWN.end);
            return true;
        }
    };

    const onDoubleClick: MouseEventHandler<HTMLCanvasElement> = (e) => {

        console.log(CANVAS_ACTIONS.DOUBLE_CLICK.start);

        const canvas = canvasRef.current;
        if(canvas === null) {
            console.log(CANVAS_CONDITIONS.MISSING_CANVAS_REF)
            console.log(CANVAS_ACTIONS.DOUBLE_CLICK.end);
            return;
        }
        const context = canvas.getContext('2d');
        if(context === null) {
            console.log(CANVAS_CONDITIONS.MISSING_CANVAS_CONTEXT)
            console.log(CANVAS_ACTIONS.DOUBLE_CLICK.end);
            return;
        }

        const mouse = crossBrowserRelativeMousePos(e);
        setSelectedObject(selectObject(mouse.x, mouse.y));

        if (selectedObject === null) {
            const newObject = new NodeC(mouse.x, mouse.y);
            newObject.nodeId = uniqueId();
            setSelectedObject(newObject)
            setNodes([...nodes, newObject])
            resetCaret();
            if(canvasRef.current === null) return
            draw(canvas, context, nodes, links, currentLink, theme, selectedObject, caretVisible, inCanvas, setJsonEditor);
        } else if (selectedObject instanceof NodeC) {
            selectedObject.isAcceptState = !selectedObject.isAcceptState;
            setSelectedObject(selectedObject);
            if (selectedObject.isAcceptState){
                draw(canvas, context, nodes, links, currentLink, theme, selectedObject, caretVisible, inCanvas, setJsonEditor);
            }
        }

        console.log(CANVAS_ACTIONS.DOUBLE_CLICK.end);
    };

    const onMouseMove: MouseEventHandler<HTMLCanvasElement> = (e) => {

        console.log(CANVAS_ACTIONS.MOUSE_MOVE.start);

        const canvas = canvasRef.current;
        if(canvas === null) {
            console.log(CANVAS_CONDITIONS.MISSING_CANVAS_REF)
            console.log(CANVAS_ACTIONS.MOUSE_MOVE.end);
            return;
        }
        const context = canvas.getContext('2d');
        if(context === null) {
            console.log(CANVAS_CONDITIONS.MISSING_CANVAS_CONTEXT)
            console.log(CANVAS_ACTIONS.MOUSE_MOVE.end);
            return;
        }

        const mouse = crossBrowserRelativeMousePos(e);

        if (currentLink != null) {
            let targetNode = selectObject(mouse.x, mouse.y);
            if (!(targetNode instanceof NodeC)) {
                targetNode = null;
            }

            if (selectedObject == null) {
                if (targetNode != null) {
                    originalClick && setCurrentLink(new StartLink(targetNode, originalClick));
                } else {
                    originalClick && setCurrentLink(new TemporaryLink(new NodeC(originalClick.x, originalClick.y), new NodeC(mouse.x, mouse.y)));
                }
            } else {
                if (targetNode === selectedObject) {
                    setCurrentLink(new SelfLink(selectedObject, mouse));
                } else if (targetNode != null) {
                    if(selectedObject instanceof NodeC)
                        setCurrentLink(new Link(selectedObject, targetNode));
                } else {
                    if(selectedObject instanceof NodeC){
                        const closestPoint = selectedObject.closestPointOnCircle(mouse.x, mouse.y);
                        setCurrentLink(new TemporaryLink(new NodeC(closestPoint.x, closestPoint.y), new NodeC(mouse.x, mouse.y)));
                    }
                }
            }
            draw(canvas, context, nodes, links, currentLink, theme, selectedObject, caretVisible, inCanvas, setJsonEditor);
        }
        
        if (movingObject && selectedObject !== null) {
            selectedObject.setAnchorPoint(mouse.x, mouse.y);
            if (selectedObject instanceof NodeC) {
                setSelectedObject(snapNode(selectedObject));
            }
            draw(canvas, context, nodes, links, currentLink, theme, selectedObject, caretVisible, inCanvas, setJsonEditor);
        }

        console.log(CANVAS_ACTIONS.MOUSE_MOVE.end);
    };

    const onMouseUp: MouseEventHandler<HTMLCanvasElement> = (e) => {
        console.log(CANVAS_ACTIONS.MOUSE_UP.start);

        const canvas = canvasRef.current;
        if(canvas === null) {
            console.log(CANVAS_CONDITIONS.MISSING_CANVAS_REF)
            console.log(CANVAS_ACTIONS.MOUSE_UP.end);
            return;
        }
        const context = canvas.getContext('2d');
        if(context === null) {
            console.log(CANVAS_CONDITIONS.MISSING_CANVAS_CONTEXT)
            console.log(CANVAS_ACTIONS.MOUSE_UP.end);
            return;
        }

        setMovingObject(false);

        if (currentLink != null) {
            if (!(currentLink instanceof TemporaryLink)) {
                setSelectedObject(currentLink);
                currentLink.linkId = uniqueId()
                setLinks([...valueLinks, currentLink])
                resetCaret();
            }
            setCurrentLink(null);
            draw(canvas, context, nodes, links, currentLink, theme, selectedObject, caretVisible, inCanvas, setJsonEditor);
        }
        setShift(false)

        console.log(CANVAS_ACTIONS.MOUSE_UP.end);
    };

    return (
        <canvas 
            className="rounded bg-white shadow-lg" 
            ref={canvasRef}
            id="canvas"
            style={styleProps.current}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onDoubleClick={onDoubleClick}
            onMouseUp={onMouseUp}
        />
    )
}