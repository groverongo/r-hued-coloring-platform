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
  const [styleProps, setStyleProps] = useState<CSSProperties>({});

  useEffect(() => {
    setStyleProps({
      height: 700,
      width: (1200 * screen.width) / 2000,
    });
  }, []);

  const [nodesInfo, setNodesInfo] = useState<{ x: number; y: number }[]>([]);
  const nodesRefs = useRef<(NodeGRef | null)[]>([]);
  const [nodeCurrentIndex, setNodeCurrentIndex] = useState<number | null>(null);

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
      
    if (nodeCurrentIndex === null) return;
    
    if (nodesRefs.current[nodeCurrentIndex] === null) return;
    
    const ref = nodesRefs.current[nodeCurrentIndex];
    
    if (ref === null) return;
    
    if (e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key)) {
        ref.appendCharacter(e.key);
    } else if (e.key === "Backspace") {
        ref.deleteCharacter();
    }
  };

  useEffect(() => {
    console.log(nodesInfo.length);
    nodesRefs.current = nodesInfo.map(
      (_, index) => nodesRefs.current[index] ?? null
    );

    if (nodeCurrentIndex !== null) {
      nodesRefs.current[nodeCurrentIndex]?.deselect();
      nodesRefs.current[nodesRefs.current.length -1]?.select();
    }

    nodesRefs.current.map((ref, index) => {
      if (ref !== null) {
        console.log(index, ref.x, ref.y);
      } else {
        console.log(index, "null");
      }
    });
  }, [nodesInfo.length]);

  return (
    <div onKeyDown={onKeyDown} tabIndex={0}>
      <Stage
        id="KonvaStage"
        style={styleProps}
        width={styleProps.width as number}
        height={styleProps.height as number}
        onDblClick={(e) => {
          setNodesInfo((prev) => [
            ...prev,
            { x: e.evt.offsetX, y: e.evt.offsetY },
          ]);
        }}
      >
        <Layer>
          {nodesInfo.map((pos, index) => (
            <NodeG
              key={index}
              ref={(e) => {
                nodesRefs.current[index] = e;
              }}
              x={pos.x}
              y={pos.y}
              onSelect={() => {
                if (nodeCurrentIndex !== null) {
                  nodesRefs.current[nodeCurrentIndex]?.deselect();
                }
                setNodeCurrentIndex(index);
              }}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
