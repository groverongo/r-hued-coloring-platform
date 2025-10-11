import Link from "@/classes/link";
import NodeC, { NodeGRef } from "@/classes/node";
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
  KeyboardEventHandler,
  MouseEventHandler,
  RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { Circle, Layer, Rect, Stage, Text } from "react-konva";
import Konva from "konva";
import NodeG from "@/classes/node";

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
      height: 700,
      width: (1200 * screen.width) / 2000,
    });
  }, []);


  const shapeRef = useRef<Konva.Rect | null>(null);

  const positions = useState<{ x: number; y: number }[]>([]);
  const positionRefs = useRef<(NodeGRef | null)[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
      
    if (currentIndex === null) return;
    
    if (positionRefs.current[currentIndex] === null) return;
    
    const ref = positionRefs.current[currentIndex];
    
    if (ref === null) return;
    
    if (e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key)) {
        ref.appendCharacter(e.key);
    } else if (e.key === "Backspace") {
        ref.deleteCharacter();
    }
  };

  useEffect(() => {
    console.log(positions[0].length);
    positionRefs.current = positions[0].map(
      (_, index) => positionRefs.current[index] ?? null
    );

    if (currentIndex !== null) {
      positionRefs.current[currentIndex]?.deselect();
      positionRefs.current[positionRefs.current.length -1]?.select();
    }

    positionRefs.current.map((ref, index) => {
      if (ref !== null) {
        console.log(index, ref.x, ref.y);
      } else {
        console.log(index, "null");
      }
    });
  }, [positions[0].length]);

  return (
    <div onKeyDown={onKeyDown} tabIndex={0}>
      <Stage
        id="KonvaStage"
        style={styleProps}
        width={styleProps.width as number}
        height={styleProps.height as number}
        onDblClick={(e) => {
          positions[1]((prev) => [
            ...prev,
            { x: e.evt.offsetX, y: e.evt.offsetY },
          ]);
        }}
      >
        <Layer>
          <NodeG x={100} y={100} />

          {positions[0].map((pos, index) => (
            <NodeG
              key={index}
              ref={(e) => {
                positionRefs.current[index] = e;
              }}
              x={pos.x}
              y={pos.y}
              onSelect={() => {
                if (currentIndex !== null) {
                  positionRefs.current[currentIndex]?.deselect();
                }
                setCurrentIndex(index);
              }}
            />
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
          <Circle x={200} y={100} radius={50} fill="green" draggable />
        </Layer>
      </Stage>
    </div>
  );
}
