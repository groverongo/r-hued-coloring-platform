import {
  CSSProperties,
  FocusEventHandler,
  KeyboardEventHandler,
  useEffect, useRef, useState
} from "react";
import { Layer, Stage } from "react-konva";
import NodeG, { NodeGRef } from "@/classes/node";
import TemporaryLinkG from "@/classes/temporary_link";
import LinkG, { LinkGRef } from "@/classes/link";
import { NODE_G_MODES } from "@/common/constant";
import { isIntString } from "@/common/utilities";
import { useElementRef } from "@/common/refs";
import { useAtom } from "jotai";
import { v4 as uuidv4 } from 'uuid';
import { edgeCurrentIdAtom, edgeGraphAtom, graphAdjacencyListAtom, vertexCurrentIdAtom, vertexGraphAtom } from "@/common/atoms";

export default function Canvas() {
  const [styleProps, setStyleProps] = useState<CSSProperties>({});

  useEffect(() => {
    setStyleProps({
      height: 700,
      width: (1200 * screen.width) / 2000,
      border: "3px solid black",
      borderRadius: "15px",
    });
  }, []);

  const {vertexRefs, edgeRefs, stageRef} = useElementRef();

  const [vertexGraph, setVertexGraph] = useAtom(vertexGraphAtom);
  const [edgeGraph, setEdgeGraph] = useAtom(edgeGraphAtom);
  const [graphAdjacencyList, setGraphAdjacencyList] = useAtom(graphAdjacencyListAtom);

  const [nodeMode, setNodeMode] = useState<number>(0);
  const [vertexCurrentId, setVertexCurrentId] = useAtom(vertexCurrentIdAtom);
  const [edgeCurrentId, setEdgeCurrentId] = useAtom(edgeCurrentIdAtom);

  const [closestVertexId, setClosestVertexId] = useState<string | null>(null);
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

    if (vertexCurrentId !== null) {
      const ref = vertexRefs.current.get(vertexCurrentId);

      if (ref === null || ref === undefined) return;

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

        const edgeTuples = graphAdjacencyList.get(vertexCurrentId);

        setGraphAdjacencyList((prev) => {
          const newMap = new Map(prev);
          
          edgeTuples?.forEach((edgeTuple) => {
            const edge = edgeGraph.get(edgeTuple[1]);
            if(edge === undefined) return;
            newMap.get(edgeTuple[0])?.delete(edge.fromEntry);
          });
          newMap.delete(vertexCurrentId);

          return newMap;
        });
        setEdgeGraph((prev) => {
          const newMap = new Map(prev);
          edgeTuples?.forEach((edgeTuple) => {
            newMap.delete(edgeTuple[1]);
          });
          return newMap;
        });
        setVertexGraph((prev) => {
          const newMap = new Map(prev);
          newMap.delete(vertexCurrentId);
          return newMap;
        });
        setVertexCurrentId(null);
      } else if (e.key === "Control") {
        setNodeMode((prev) => (prev + 1) % NODE_G_MODES.length);
      }
    } else if (edgeCurrentId !== null) {
      const ref = edgeRefs.current.get(edgeCurrentId);

      if (ref === null || ref === undefined) return;

      if (e.key === "Delete") {
        ref.deselect();
        // edgeRefs.current.delete(edgeCurrentId);
        setGraphAdjacencyList((prev) => {
          const edge = edgeGraph.get(edgeCurrentId);
          if(edge === undefined) return prev;
          const newMap = new Map(prev);
          newMap.get(edge.from)?.delete(edge.toEntry);
          newMap.get(edge.to)?.delete(edge.fromEntry);
          return newMap;
        });
        setEdgeGraph((prev) => {
          const newMap = new Map(prev);
          newMap.delete(edgeCurrentId);
          return newMap;
        });
        setEdgeCurrentId(null);
      }
    }
  };

  function deselectObjects(vertexId: string | null, edgeId: string | null) {
    if (vertexCurrentId !== null && vertexCurrentId !== vertexId) {
      vertexRefs.current.get(vertexCurrentId)?.deselect();
    }
    setVertexCurrentId(vertexId);

    if (edgeCurrentId !== null && edgeCurrentId !== edgeId) {
      edgeRefs.current.get(edgeCurrentId)?.deselect();
    }
    setEdgeCurrentId(edgeId);
  }

  useEffect(() => {
    const newVertexRefs = new Map<string, NodeGRef | null>();
    Array.from(vertexGraph.keys()).forEach((id) => {
      newVertexRefs.set(id, vertexRefs.current?.get(id) ?? null);
    });
    vertexRefs.current = newVertexRefs;

    if (vertexCurrentId !== null) {
      vertexRefs.current.get(vertexCurrentId)?.deselect();
      const [_, ref] = Array.from(vertexRefs.current).at(-1) ?? [null, null]; 
      ref?.select();
    }
  }, [vertexGraph.size]);

  useEffect(() => {
    const newEdgeRefs = new Map<string, LinkGRef | null>();
    Array.from(edgeGraph.keys()).forEach((id) => {
      newEdgeRefs.set(id, edgeRefs.current?.get(id) ?? null);
    });
    edgeRefs.current = newEdgeRefs;

    if (edgeCurrentId !== null) {
      edgeRefs.current.get(edgeCurrentId)?.deselect();
      const [_, ref] = Array.from(edgeRefs.current).at(-1) ?? [null, null]; 
      ref?.select();
    }
  }, [edgeGraph.size]);

  useEffect(() => {
    console.log('graphAdjacencyList', graphAdjacencyList)
  }, [graphAdjacencyList])

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

          const vertexId = uuidv4();
          setGraphAdjacencyList((prev) => {
            const newMap = new Map(prev);
            newMap.set(vertexId, new Set<[string, string]>());
            return newMap;
          });
          setVertexGraph((prev) => {
            const newMap = new Map(prev);
            newMap.set(vertexId, {x: e.evt.offsetX, y: e.evt.offsetY});
            return newMap;
          });
        }}
        onMouseMove={(e) => {
          if (mouseDownPos === null) return;
          for (const [i, ref] of vertexRefs.current.entries()) {
            if (ref === null) continue;

            const distance = Math.sqrt(
              Math.pow(ref.x - e.evt.offsetX, 2) +
                Math.pow(ref.y - e.evt.offsetY, 2)
            );
            if (distance > 60) continue;
            setClosestVertexId(i);
            setMouseDownPos({ x: ref.x, y: ref.y });
            return;
          }
          setClosestVertexId(null);
          setMouseDownPos({ x: e.evt.offsetX, y: e.evt.offsetY });
        }}
        onMouseDown={(e) => {
          setMouseDownPos({ x: e.evt.offsetX, y: e.evt.offsetY });
        }}
        onMouseUp={(e) => {
          if (mouseDownPos === null) return;
          if (closestVertexId !== null && vertexCurrentId !== null && vertexCurrentId !== closestVertexId) {
            const edgeId = uuidv4();
            const fromEntry: [string, string] = [vertexCurrentId, edgeId];
            const toEntry: [string, string] = [closestVertexId, edgeId];
            setEdgeGraph((prev) => {
              const newMap = new Map(prev);
              newMap.set(edgeId, {from: vertexCurrentId, to: closestVertexId, fromEntry, toEntry});
              return newMap;
            });
            setGraphAdjacencyList((prev) => {
              const newMap = new Map(prev);
              newMap.get(vertexCurrentId)?.add(toEntry);
              newMap.get(closestVertexId)?.add(fromEntry);
              return newMap;
            });
            setClosestVertexId(null);
          }
          setMouseDownPos(null);
        }}
      >
        <Layer>
          {shiftPressed &&
            mouseDownPos !== null &&
            vertexCurrentId !== null && (
              <TemporaryLinkG
                from={{
                  x: vertexRefs.current.get(vertexCurrentId)?.x || 0,
                  y: vertexRefs.current.get(vertexCurrentId)?.y || 0,
                }}
                to={{ x: mouseDownPos.x, y: mouseDownPos.y }}
              />
            )}
          {Array.from(edgeGraph.entries()).map(([index, edge]) => {

            const fromRef = vertexRefs.current.get(edge.from);
            const toRef = vertexRefs.current.get(edge.to);

            const from = fromRef ? {x: fromRef.x, y: fromRef.y} : {x: 0, y: 0};
            const to = toRef ? {x: toRef.x, y: toRef.y} : {x: 0, y: 0};

            return (<LinkG
              key={index}
              ref={(e) => {
                edgeRefs.current.set(index, e);
              }}
              onSelect={() => {
                deselectObjects(null, index);
              }}
              fromId={edge.from}
              toId={edge.to}
              from={from}
              to={to}
            />)
          })}
          {Array.from(graphAdjacencyList.keys()).map((key) => (
            <NodeG
              key={key}
              ref={(e) => {
                vertexRefs.current.set(key, e);
              }}
              x={vertexGraph.get(key)?.x || 0}
              y={vertexGraph.get(key)?.y || 0}
              onSelect={() => {
                deselectObjects(key, null);
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
