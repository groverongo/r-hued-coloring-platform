import Link from "@/classes/link";
import NodeC from "@/classes/node";
import SelfLink from "@/classes/self_link";
import StartLink from "@/classes/start_link";
import { TemporaryLink } from "@/classes/temporary_link";
import {
  caretTimerAtom,
  currentLinkAtom,
  jsonEditorAtom,
  linksAtom,
  nodesAtom,
  selectedObjectAtom,
  themeAtom,
} from "@/common/atoms";
import { SNAP_TO_PADDING } from "@/common/constant";
import { CANVAS_ACTIONS, CANVAS_CONDITIONS } from "@/common/messages";
import { useElementRef, useOperationFlagsRef } from "@/common/refs";
import {
  crossBrowserRelativeMousePos,
  draw,
  uniqueId,
} from "@/common/utilities";
import { useAtom, useAtomValue } from "jotai";
import { useSetAtom } from "jotai";
import {
  CSSProperties,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { Circle, Layer, Rect, Stage, Text } from "react-konva";
import Konva from 'konva';

export default function Canvas() {
  const { canvasRef } = useElementRef();
  const [selectedObject, setSelectedObject] = useAtom(selectedObjectAtom);
  const [nodes, setNodes] = useAtom(nodesAtom);
  const links = useAtomValue(linksAtom);
  const [currentLink, setCurrentLink] = useAtom(currentLinkAtom);
  const editor = useAtomValue(jsonEditorAtom);
  const [valueLinks, setLinks] = useAtom(linksAtom);
  const [caretTimer, setCaretTimer] = useAtom(caretTimerAtom);
  const theme = useAtomValue(themeAtom);
  const setJsonEditor = useSetAtom(jsonEditorAtom);
  const [styleProps, setStyleProps] = useState<CSSProperties>({});

  const movingObjectRef = useRef(false);
  const originalClickRef = useRef<{ x: number; y: number }>(undefined);
  const { shiftRef, inCanvasRef, caretVisibleRef } = useOperationFlagsRef();

  const deltaMouseX = useRef<number>(null);
  const deltaMouseY = useRef<number>(null);

  useEffect(() => {
    setStyleProps({
      height: `${700}px`,
      width: `${(1200 * screen.width) / 2000}px`,
    });
  }, []);

  useEffect(() => {
    return () => {
      if (caretTimer) clearInterval(caretTimer);
    };
  }, [caretTimer]);

  function resetCaret() {
    const handler: Function = () => {
      const canvas = canvasRef.current;
      if (canvas === null) return;
      const context = canvas.getContext("2d");
      if (context === null) return;
      caretVisibleRef.current = !caretVisibleRef.current;
      draw(
        canvas,
        context,
        nodes,
        links,
        currentLink,
        theme,
        selectedObject,
        caretVisibleRef.current,
        inCanvasRef.current,
        setJsonEditor
      );
    };

    clearInterval(caretTimer);

    setCaretTimer(setInterval(handler, 500));

    caretVisibleRef.current = true;
  }

  function selectObject(x: number, y: number) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].containsPoint(x, y)) {
        return nodes[i];
      }
    }
    for (let i = 0; i < links.length; i++) {
      const l = links[i];
      if (!(l instanceof TemporaryLink) && l.containsPoint(x, y)) {
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
    if (canvas === null) {
      console.log(CANVAS_CONDITIONS.MISSING_CANVAS_REF);
      console.log(CANVAS_ACTIONS.MOUSE_DOWN.end);
      return;
    }
    const context = canvas.getContext("2d");
    if (context === null) {
      console.log(CANVAS_CONDITIONS.MISSING_CANVAS_CONTEXT);
      console.log(CANVAS_ACTIONS.MOUSE_DOWN.end);
      return;
    }

    const mouse = crossBrowserRelativeMousePos(e);
    inCanvasRef.current = true;

    // if selectedObject is not null than save the json of the editor into the node
    const json = editor;
    if (
      selectedObject != null &&
      (selectedObject instanceof NodeC ||
        selectedObject instanceof Link ||
        selectedObject instanceof SelfLink)
    ) {
      selectedObject.setJsonModel(json);
    }

    movingObjectRef.current = false;
    originalClickRef.current = mouse;

    setSelectedObject(selectObject(mouse.x, mouse.y));
    if (selectedObject != null) {
      if (shiftRef.current && selectedObject instanceof NodeC) {
        setCurrentLink(new SelfLink(selectedObject, mouse));
      } else {
        movingObjectRef.current = true;
        deltaMouseX.current = deltaMouseY.current = 0;
        if (selectedObject instanceof NodeC) {
          selectedObject.setMouseStart(mouse.x, mouse.y);
        } else if (selectedObject instanceof SelfLink) {
          selectedObject.setMouseStart(mouse.x, mouse.y);
        }
      }
      resetCaret();
    } else if (shiftRef.current) {
      setCurrentLink(
        new TemporaryLink(
          new NodeC(mouse.x, mouse.y),
          new NodeC(mouse.x, mouse.y)
        )
      );
    }

    draw(
      canvas,
      context,
      nodes,
      links,
      currentLink,
      theme,
      selectedObject,
      caretVisibleRef.current,
      inCanvasRef.current,
      setJsonEditor
    );

    if (inCanvasRef.current) {
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
    if (canvas === null) {
      console.log(CANVAS_CONDITIONS.MISSING_CANVAS_REF);
      console.log(CANVAS_ACTIONS.DOUBLE_CLICK.end);
      return;
    }
    const context = canvas.getContext("2d");
    if (context === null) {
      console.log(CANVAS_CONDITIONS.MISSING_CANVAS_CONTEXT);
      console.log(CANVAS_ACTIONS.DOUBLE_CLICK.end);
      return;
    }

    const mouse = crossBrowserRelativeMousePos(e);
    setSelectedObject(selectObject(mouse.x, mouse.y));

    if (selectedObject === null) {
      const newObject = new NodeC(mouse.x, mouse.y);
      newObject.nodeId = uniqueId();
      setSelectedObject(newObject);
      setNodes([...nodes, newObject]);
      resetCaret();
      if (canvasRef.current === null) return;
      draw(
        canvas,
        context,
        nodes,
        links,
        currentLink,
        theme,
        newObject,
        caretVisibleRef.current,
        inCanvasRef.current,
        setJsonEditor
      );
    } else if (selectedObject instanceof NodeC) {
      setSelectedObject((prev) => {
        if (!(prev instanceof NodeC)) {
          return prev;
        }
        prev.isAcceptState = !prev.isAcceptState;
        if (prev.isAcceptState)
          draw(
            canvas,
            context,
            nodes,
            links,
            currentLink,
            theme,
            selectedObject,
            caretVisibleRef.current,
            inCanvasRef.current,
            setJsonEditor
          );
        return prev;
      });
    }

    console.log(CANVAS_ACTIONS.DOUBLE_CLICK.end);
  };

  const onMouseMove: MouseEventHandler<HTMLCanvasElement> = (e) => {
    console.log(CANVAS_ACTIONS.MOUSE_MOVE.start);

    const canvas = canvasRef.current;
    if (canvas === null) {
      console.log(CANVAS_CONDITIONS.MISSING_CANVAS_REF);
      console.log(CANVAS_ACTIONS.MOUSE_MOVE.end);
      return;
    }
    const context = canvas.getContext("2d");
    if (context === null) {
      console.log(CANVAS_CONDITIONS.MISSING_CANVAS_CONTEXT);
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
          originalClickRef.current &&
            setCurrentLink(new StartLink(targetNode, originalClickRef.current));
        } else {
          originalClickRef.current &&
            setCurrentLink(
              new TemporaryLink(
                new NodeC(
                  originalClickRef.current.x,
                  originalClickRef.current.y
                ),
                new NodeC(mouse.x, mouse.y)
              )
            );
        }
      } else {
        if (targetNode === selectedObject) {
          setCurrentLink(new SelfLink(selectedObject, mouse));
        } else if (targetNode !== null) {
          if (selectedObject instanceof NodeC)
            setCurrentLink(new Link(selectedObject, targetNode));
        } else {
          if (selectedObject instanceof NodeC) {
            const closestPoint = selectedObject.closestPointOnCircle(
              mouse.x,
              mouse.y
            );
            setCurrentLink(
              new TemporaryLink(
                new NodeC(closestPoint.x, closestPoint.y),
                new NodeC(mouse.x, mouse.y)
              )
            );
          }
        }
      }
      draw(
        canvas,
        context,
        nodes,
        links,
        currentLink,
        theme,
        selectedObject,
        caretVisibleRef.current,
        inCanvasRef.current,
        setJsonEditor
      );
    }

    if (movingObjectRef.current && selectedObject !== null) {
      selectedObject.setAnchorPoint(mouse.x, mouse.y);
      if (selectedObject instanceof NodeC) {
        setSelectedObject(snapNode(selectedObject));
      }
      draw(
        canvas,
        context,
        nodes,
        links,
        currentLink,
        theme,
        selectedObject,
        caretVisibleRef.current,
        inCanvasRef.current,
        setJsonEditor
      );
    }

    console.log(CANVAS_ACTIONS.MOUSE_MOVE.end);
  };

  const onMouseUp: MouseEventHandler<HTMLCanvasElement> = (e) => {
    console.log(CANVAS_ACTIONS.MOUSE_UP.start);

    const canvas = canvasRef.current;
    if (canvas === null) {
      console.log(CANVAS_CONDITIONS.MISSING_CANVAS_REF);
      console.log(CANVAS_ACTIONS.MOUSE_UP.end);
      return;
    }
    const context = canvas.getContext("2d");
    if (context === null) {
      console.log(CANVAS_CONDITIONS.MISSING_CANVAS_CONTEXT);
      console.log(CANVAS_ACTIONS.MOUSE_UP.end);
      return;
    }

    movingObjectRef.current = false;

    if (currentLink != null) {
      if (!(currentLink instanceof TemporaryLink)) {
        setSelectedObject(currentLink);
        currentLink.linkId = uniqueId();
        setLinks([...valueLinks, currentLink]);
        resetCaret();
      }
      setCurrentLink(null);
      draw(
        canvas,
        context,
        nodes,
        links,
        currentLink,
        theme,
        selectedObject,
        caretVisibleRef.current,
        inCanvasRef.current,
        setJsonEditor
      );
    }
    shiftRef.current = false;

    console.log(CANVAS_ACTIONS.MOUSE_UP.end);
  };

  const shapeRef = useRef<Konva.Rect | null>(null);

  const positions = useState<{x: number, y: number}[]>([]);

  return (
    <>
      <Stage width={window.innerWidth} height={window.innerHeight} onDblClick={(e) => {
        positions[1]((prev) => [...prev, {x: e.evt.offsetX, y: e.evt.offsetY}]);
      }}>
        <Layer>
            {positions[0].map((pos, index) => (
                <Circle key={index} x={pos.x} y={pos.y} radius={50} fill="green" draggable onDblClick={(e) => {
                    positions[1]((prev) => prev.filter((_, i) => i !== index));
                }}/>
            ))}
          <Text text="Try to drag shapes" fontSize={15} />
          <Rect
            x={20}
            y={50}
            width={100}
            height={100}
            fill="red"
            shadowBlur={10}
            draggable
            ref={shapeRef}
            onDragMove={(e) => {
            //   console.log(JSON.stringify(e));
                console.log(shapeRef.current?.x());
            }}
          />
          <Circle x={200} y={100} radius={50} fill="green" draggable/>
        </Layer>
      </Stage>
      <canvas
        className="rounded bg-white shadow-lg"
        ref={canvasRef}
        id="canvas"
        style={styleProps}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onDoubleClick={onDoubleClick}
        onMouseUp={onMouseUp}
      />
    </>
  );
}
