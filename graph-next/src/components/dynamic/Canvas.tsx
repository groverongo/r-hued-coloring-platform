import { NodeGRef } from "@/classes/node";
import {
  CSSProperties,
  FocusEventHandler,
  KeyboardEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import { Layer, Stage } from "react-konva";
import NodeG from "@/classes/node";
import TemporaryLinkG from "@/classes/temporary_link";
import LinkG, { LinkGRef } from "@/classes/link";
import { NODE_G_MODES } from "@/common/constant";
import { isIntString } from "@/common/utilities";
import { useElementRef } from "@/common/refs";
import { useAtom } from "jotai";
import { linkCurrentIndexAtom, linksInfoAtom, nodeCurrentIndexAtom, nodesInfoAtom } from "@/common/atoms";

export default function Canvas() {
  const [styleProps, setStyleProps] = useState<CSSProperties>({});

  useEffect(() => {
    setStyleProps({
      height: 700,
      width: (1200 * screen.width) / 2000,
    });
  }, []);

  const {nodesRefs, linksRefs, stageRef} = useElementRef();

  const [nodesInfo, setNodesInfo] = useAtom(nodesInfoAtom);

  const [linksInfo, setLinksInfo] = useAtom(linksInfoAtom);

  const [nodeMode, setNodeMode] = useState<number>(0);
  const [nodeCurrentIndex, setNodeCurrentIndex] = useAtom(nodeCurrentIndexAtom);
  const [linkCurrentIndex, setLinkCurrentIndex] = useAtom(linkCurrentIndexAtom);

  const [closestNodeIndex, setClosestNodeIndex] = useState<number | null>(null);
  const [keyDownUnblock, setKeyDownUnblock] = useState<boolean>(true);

  const [shiftPressed, setShiftPressed] = useState<boolean>(false);
  const [mouseDownPos, setMouseDownPos] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const onBlur: FocusEventHandler<HTMLDivElement> = (e) => {
    setKeyDownUnblock(true);
    setShiftPressed(false);
  };

  const onKeyUp: KeyboardEventHandler<HTMLDivElement> = (e) => {
    setKeyDownUnblock(true);
    if (e.key === "Shift") setShiftPressed(false);
  };

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (keyDownUnblock) setKeyDownUnblock(false);

    if (e.key === "Shift") {
      setShiftPressed(true);
    }

    if (nodeCurrentIndex !== null) {
      const ref = nodesRefs.current[nodeCurrentIndex];

      if (ref === null) return;

      if (e.key.length === 1 && /^[a-zA-Z0-9]$/.test(e.key)) {
        if (NODE_G_MODES[nodeMode] === "Label") {
          ref.appendCharacter(e.key);
        } else if (NODE_G_MODES[nodeMode] === "Color" && isIntString(e.key)) {
          ref.changeColor(+e.key);
        }
      } else if (e.key === "Backspace") {
          if (NODE_G_MODES[nodeMode] === "Label") {
            ref.deleteCharacter();
          } else if (NODE_G_MODES[nodeMode] === "Color") {
            ref.changeColor(null);
          }
      } else if (e.key === "Delete") {
        ref.deselect();
        nodesRefs.current.splice(nodeCurrentIndex, 1);
        nodesInfo.splice(nodeCurrentIndex, 1);
        setNodeCurrentIndex(null);
      } else if (e.key === "Control") {
        setNodeMode((prev) => (prev + 1) % NODE_G_MODES.length);
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
  }, [nodesInfo.length]);

  return (
    <div onKeyDown={onKeyDown} onKeyUp={onKeyUp} onBlur={onBlur} tabIndex={0}>
      <Stage
        id="KonvaStage"
        style={styleProps}
        width={styleProps.width as number}
        height={styleProps.height as number}
        ref={stageRef}
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
              mode={nodeMode}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
