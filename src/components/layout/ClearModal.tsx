import {
  linkCurrentIndexAtom,
  linksInfoAtom,
  nodeCurrentIndexAtom,
  nodesInfoAtom,
} from "@/common/atoms";
import { useSetAtom } from "jotai";
import { MouseEventHandler, useEffect, useState } from "react";
import { Dialog } from "radix-ui";
import { useElementRef } from "@/common/refs";

export const DialogDemo = () => {
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

  const { nodesRefs, linksRefs } = useElementRef();

  const setNodesInfo = useSetAtom(nodesInfoAtom);
  const setLinksInfo = useSetAtom(linksInfoAtom);
  const setNodeCurrentIndex = useSetAtom(nodeCurrentIndexAtom);
  const setLinkCurrentIndex = useSetAtom(linkCurrentIndexAtom);

  function clearCanvas() {
    setNodesInfo([]);
    setLinksInfo([]);
    setNodeCurrentIndex(null);
    setLinkCurrentIndex(null);
    nodesRefs.current = [];
    linksRefs.current = [];
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
