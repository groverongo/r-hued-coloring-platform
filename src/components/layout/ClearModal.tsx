import {
  edgeCurrentIdAtom,
  edgeGraphAtom,
  graphAdjacencyListAtom,
  vertexCurrentIdAtom,
  vertexGraphAtom,
} from "@/common/atoms";
import { useSetAtom } from "jotai";
import { MouseEventHandler, useEffect, useState } from "react";
import { Dialog } from "radix-ui";
import { useElementRef } from "@/common/refs";
import { NodeGRef } from "@/classes/node";
import { LinkGRef } from "@/classes/link";

export const ClearModal = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.shiftKey) && e.key === "L") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const { vertexRefs, edgeRefs } = useElementRef();

  const setVertexGraph = useSetAtom(vertexGraphAtom);
  const setEdgeGraph = useSetAtom(edgeGraphAtom);
  const setGraphStructure = useSetAtom(graphAdjacencyListAtom);
  const setVertexCurrentId = useSetAtom(vertexCurrentIdAtom);
  const setEdgeCurrentId = useSetAtom(edgeCurrentIdAtom);

  function clearCanvas() {
    setVertexGraph(new Map<string, {x: number, y: number, xRelative: number, yRelative: number}>());
    setEdgeGraph(new Map<string, {from: string, to: string, fromEntry: [string, string], toEntry: [string, string]}>());
    setGraphStructure(new Map<string, Set<[string, string]>>());
    setVertexCurrentId(null);
    setEdgeCurrentId(null);
    vertexRefs.current = new Map<string, NodeGRef | null>();
    edgeRefs.current = new Map<string, LinkGRef | null>();
    // draw(undefined, undefined, nodes, links, currentLink, theme, selectedObjectAtom, caretVisibleAtom, inCanvas)
  }

  const clearCanvasConfirm: MouseEventHandler<HTMLButtonElement> = (e) => {
    clearCanvas();
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild></Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          <Dialog.Title className="DialogTitle">Clear</Dialog.Title>
          <Dialog.Description className="DialogDescription">
            Are you sure you want to clear the canvas?
          </Dialog.Description>
          <Dialog.Close asChild>
            <button
              className="Button green"
              style={{ marginRight: "1rem" }}
              onClick={clearCanvasConfirm}
            >
              Yes
            </button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <button className="Button red" style={{ marginRight: "1rem" }}>
              No
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
