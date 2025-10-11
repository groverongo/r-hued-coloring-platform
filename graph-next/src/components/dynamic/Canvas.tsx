import { NodeGRef } from "@/classes/node";
import {
  CSSProperties,
  KeyboardEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { Layer, Stage } from "react-konva";
import NodeG from "@/classes/node";
import TemporaryLinkG from "@/classes/temporary_link";
import LinkG, { LinkGProps } from "@/classes/link";

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

  const [linksInfo, setLinksInfo] = useState<
    { fromIndex: number; toIndex: number }[]
  >([]);
  const linksRefs = useRef<(LinkGProps | null)[]>([]);

  const [nodeCurrentIndex, setNodeCurrentIndex] = useState<number | null>(null);
  const [linkCurrentIndex, setLinkCurrentIndex] = useState<number | null>(null);

  const [closestNodeIndex, setClosestNodeIndex] = useState<number | null>(null);
  const [keyDownUnblock, setKeyDownUnblock] = useState<boolean>(true);

  const [shiftPressed, setShiftPressed] = useState<boolean>(false);
  const [mouseDownPos, setMouseDownPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const onKeyUp: KeyboardEventHandler<HTMLDivElement> = (e) => {
    setKeyDownUnblock(true);
    if (e.key === "Shift") setShiftPressed(false);
  };

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    console.log(e.key);
    if (keyDownUnblock) setKeyDownUnblock(false);

    if (e.key === "Shift") {
      setShiftPressed(true);
    }

    if(nodeCurrentIndex !== null) {
        const ref = nodesRefs.current[nodeCurrentIndex];

        if (ref === null) return;

        if (e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key)) {
            ref.appendCharacter(e.key);
        } else if (e.key === "Backspace") {
            ref.deleteCharacter();
        } else if (e.key === "Delete") {
            ref.deselect();
            nodesRefs.current.splice(nodeCurrentIndex, 1);
            nodesInfo.splice(nodeCurrentIndex, 1);
            setNodeCurrentIndex(null);
        }
    } else if (linkCurrentIndex !== null) {
        const ref = linksRefs.current[linkCurrentIndex];

        if (ref === null) return;

        if (e.key === "Delete") {
            ref.deselect();
            linksRefs.current.splice(linkCurrentIndex, 1);
            linksInfo.splice(linkCurrentIndex, 1);
            setLinkCurrentIndex(null);  
        }
    }
  };

  function deselectObjects(nodeIndex: number | null, linkIndex: number | null) {
    if (nodeCurrentIndex !== null && nodeCurrentIndex !== nodeIndex) {
      nodesRefs.current[nodeCurrentIndex]?.deselect();
    }
    setNodeCurrentIndex(nodeIndex);

    if (linkCurrentIndex !== null && linkCurrentIndex !== linkIndex) {
      linksRefs.current[linkCurrentIndex]?.deselect();
    }
    setLinkCurrentIndex(linkIndex);
  }

  useEffect(() => {
    console.log(nodesInfo.length);
    nodesRefs.current = nodesInfo.map(
      (_, index) => nodesRefs.current[index] ?? null
    );

    if (nodeCurrentIndex !== null) {
      nodesRefs.current[nodeCurrentIndex]?.deselect();
      nodesRefs.current[nodesRefs.current.length - 1]?.select();
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
    <div onKeyDown={onKeyDown} onKeyUp={onKeyUp} tabIndex={0}>
      <Stage
        id="KonvaStage"
        style={styleProps}
        width={styleProps.width as number}
        height={styleProps.height as number}
        onDblClick={(e) => {
          if (!keyDownUnblock) return;

          setNodesInfo((prev) => [
            ...prev,
            { x: e.evt.offsetX, y: e.evt.offsetY },
          ]);
        }}
        onMouseMove={(e) => {
          if (mouseDownPos === null) return;
          for (let i = 0; i < nodesRefs.current.length; i++) {
            const ref = nodesRefs.current[i];
            if (ref === null) continue;

            const distance = Math.sqrt(
              Math.pow(ref.x - e.evt.offsetX, 2) +
                Math.pow(ref.y - e.evt.offsetY, 2)
            );
            if (distance > 60) continue;
            setClosestNodeIndex(i);
            setMouseDownPos({ x: ref.x, y: ref.y });
            return;
          }
          setClosestNodeIndex(null);
          setMouseDownPos({ x: e.evt.offsetX, y: e.evt.offsetY });
        }}
        onMouseDown={(e) => {
          setMouseDownPos({ x: e.evt.offsetX, y: e.evt.offsetY });
        }}
        onMouseUp={(e) => {
          if (mouseDownPos === null) return;
          if (closestNodeIndex !== null && nodeCurrentIndex !== null) {
            setLinksInfo((prev) => [
              ...prev,
              { fromIndex: nodeCurrentIndex, toIndex: closestNodeIndex },
            ]);
            setClosestNodeIndex(null);
          }
          setMouseDownPos(null);
        }}
      >
        <Layer>
          {shiftPressed &&
            mouseDownPos !== null &&
            nodeCurrentIndex !== null && (
              <TemporaryLinkG
                from={{
                  x: nodesRefs.current[nodeCurrentIndex]?.x || 0,
                  y: nodesRefs.current[nodeCurrentIndex]?.y || 0,
                }}
                to={{ x: mouseDownPos.x, y: mouseDownPos.y }}
              />
            )}
          {linksInfo.map((link, index) => (
            <LinkG
              key={index}
              ref={(e) => {
                linksRefs.current[index] = e;
              }}
              onSelect={() => {
                deselectObjects(null, index);
              }}
              fromIndex={link.fromIndex}
              toIndex={link.toIndex}
              from={{
                x: nodesRefs.current[link.fromIndex]?.x || 0,
                y: nodesRefs.current[link.fromIndex]?.y || 0,
              }}
              to={{
                x: nodesRefs.current[link.toIndex]?.x || 0,
                y: nodesRefs.current[link.toIndex]?.y || 0,
              }}
            />
          ))}
          {nodesInfo.map((pos, index) => (
            <NodeG
              key={index}
              ref={(e) => {
                nodesRefs.current[index] = e;
              }}
              x={pos.x}
              y={pos.y}
              onSelect={() => {
                deselectObjects(index, null);
              }}
              draggable={keyDownUnblock}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
