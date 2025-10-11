import { NodeGRef } from "@/classes/node";
import {
    CSSProperties,
    KeyboardEventHandler, useEffect,
    useRef,
    useState
} from "react";
import { Layer, Stage } from "react-konva";
import NodeG from "@/classes/node";
import TemporaryLinkG from "@/classes/temporary_link";

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
  const [keyDownUnblock, setKeyDownUnblock] = useState<boolean>(true);

  const [shiftPressed, setShiftPressed] = useState<boolean>(false);
  const [mouseDownPos, setMouseDownPos] = useState<{x: number, y: number} | null>(null);

  const onKeyUp: KeyboardEventHandler<HTMLDivElement> = (e) => {
    setKeyDownUnblock(true);
    if(e.key === "Shift") setShiftPressed(false);
  };

  const onKeyDown: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if(keyDownUnblock) setKeyDownUnblock(false);
    
    if(e.key === "Shift") {
        setShiftPressed(true); 
    }

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
            if(mouseDownPos === null) return;
            setMouseDownPos({x: e.evt.offsetX, y: e.evt.offsetY});
        }}

        onMouseDown={(e) => {
            setMouseDownPos({x: e.evt.offsetX, y: e.evt.offsetY});
        }}

        onMouseUp={(e) => {
            if(mouseDownPos === null) return;
            setMouseDownPos(null);
        }}
      >
        <Layer>
            {shiftPressed && mouseDownPos !== null && nodeCurrentIndex !== null && (
                <TemporaryLinkG
                    from={{x: nodesRefs.current[nodeCurrentIndex]?.x || 0, y: nodesRefs.current[nodeCurrentIndex]?.y || 0}}
                    to={{x: mouseDownPos.x, y: mouseDownPos.y}}
                />
            )}
          {nodesInfo.map((pos, index) => (
            <NodeG
              key={index}
              ref={(e) => {
                nodesRefs.current[index] = e;
              }}
              x={pos.x}
              y={pos.y}
              onSelect={() => {
                if (nodeCurrentIndex !== null && nodeCurrentIndex !== index) {
                  nodesRefs.current[nodeCurrentIndex]?.deselect();
                }
                setNodeCurrentIndex(index);
              }}
              draggable={keyDownUnblock}
            />
          ))}
        </Layer>
      </Stage>
    </div>
  );
}
