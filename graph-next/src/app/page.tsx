'use client'

import LinkC from "@/classes/link";
import NodeC from "@/classes/node";
import SelfLink from "@/classes/self_link";
import StartLink from "@/classes/start_link";
import { TemporaryLink } from "@/classes/temporary_link";
import { caretTimerAtom, caretVisibleAtom, currentLinkAtom, inCanvasAtom, jsonEditorAtom, linksAtom, nodesAtom, screenRatioAtom, selectedObjectAtom, shiftAtom, themeAtom } from "@/common/atoms";
import { CanvasRefContext } from "@/common/refs";
import { draw } from "@/common/utilities";
import { GraphBoard } from "@/components/layout/GraphBoard";
import { IO } from "@/components/layout/IO";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";

export default function Home() {
  
  const setScreenRatio = useSetAtom(screenRatioAtom);
  const [shift, setShift] = useAtom(shiftAtom);
  const inCanvas = useAtomValue(inCanvasAtom);
  const [selectedObject, setSelectedObject] = useAtom(selectedObjectAtom);
  const nodes = useAtomValue(nodesAtom);
  const links = useAtomValue(linksAtom);
  const [caretTimer, setCaretTimer] = useAtom(caretTimerAtom);
  const [caretVisible, setCaretVisible] = useAtom(caretVisibleAtom);
  const currentLink = useAtomValue(currentLinkAtom);
  const theme = useAtomValue(themeAtom);
  const setJsonEditor = useSetAtom(jsonEditorAtom);

  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  

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

  const onKeyUp: ((this: Document, ev: KeyboardEvent) => any) = (ev) => {
    if(ev.shiftKey)
      setShift(false);
  }

  const onKeyDown: ((this: Document, ev: KeyboardEvent) => any) = (ev) => {
    const key = ev.key;

    const canvas = canvasRef.current;
    if(canvas === null) return;
    const context = canvas.getContext('2d');
    if(context === null) return;

    if (ev.shiftKey) {
        setShift(true);
    } else if (!inCanvas) {
        // don't read keystrokes when other things have focus
        return true;
    } else if (key === "Backspace") { // backspace key
        if (selectedObject != null && 'text' in selectedObject) {
          setSelectedObject((prev) => {
            const filterPrev = prev as (LinkC | StartLink | SelfLink | NodeC);
            filterPrev.text = filterPrev.text.substring(0, selectedObject.text.length - 1);
            return prev;
          })
          resetCaret();
          draw(canvas, context, nodes, links, currentLink, theme, selectedObject, caretVisible, inCanvas, setJsonEditor);
          return true;
        }

        // backspace is a shortcut for the back button, but do NOT want to change pages
        return false;
    } else if (key === "Backspace" || key === "Delete") { // delete key
      if (selectedObject != null) {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i] === selectedObject) {
              nodes.splice(i--, 1);
          }
        }
        for (let i = 0; i < links.length; i++) {
          const link = links[i];
          if(link === selectedObject || (link instanceof LinkC && (link.nodeA === selectedObject || link.nodeB === selectedObject)) || ((link instanceof StartLink || link instanceof SelfLink) && link.node === selectedObject)){
            links.splice(i--, 1);
          }
        }
        setSelectedObject(null);
        draw(canvas, context, nodes, links, currentLink, theme, selectedObject, caretVisible, inCanvas, setJsonEditor);
        return true;
      }
    }

    if (shift && key.includes("Arrow") && selectedObject) {
        if (key === "ArrowUp") {
            ev.preventDefault()
            setSelectedObject(prev => {
              if(prev instanceof NodeC){
                prev.radius -= 2;
                prev.radius = Math.max(prev.radius, 0);
                return prev;
              }
              return prev;
            });
        }
        if (key === "ArrowDown") {
            ev.preventDefault()
            setSelectedObject(prev => {
              if(prev instanceof NodeC){
                prev.radius -= 2;
                prev.radius = Math.max(prev.radius, 0);
                return prev;
              }
              return prev;
            });
        }
        if (key === "ArrowRight") {
            ev.preventDefault()
            setSelectedObject(prev => {
              if(prev instanceof TemporaryLink || prev === null) return prev;
              prev.fontSize += 2.5;
              return prev;
            });
        }
        if (key === "ArrowLeft") {
            ev.preventDefault()
            setSelectedObject(prev => {
              if(prev instanceof TemporaryLink || prev === null) return prev;
              prev.fontSize -= 2;
              prev.fontSize = Math.max(prev.fontSize, 0);
              return prev;
            });
        }

        return true
    }

    if (shift && key === "L") {
        // open confirm modal
        throw Error("NOT IMPLEMENTED")
        confirmWindow.show()
    }

    if (!ev.metaKey && !ev.altKey && !ev.ctrlKey && ev.key !== "Tab" && selectedObject !== null) {
      if (key === "Shift" && inCanvas) {
        return true
      }

      if (key === "Enter" && inCanvas) {
        setSelectedObject(prev => {
          if(prev instanceof TemporaryLink || prev === null) return prev;
          prev.text += '\n';
          return prev;
        });
        resetCaret()
        draw(canvas, context, nodes, links, currentLink, theme, selectedObject, caretVisible, inCanvas, setJsonEditor);
        return true
      }
      if (key === " " && inCanvas) {
        ev.preventDefault()
      }
      if (key.length === 1) {
        setSelectedObject(prev => {
          if(prev instanceof TemporaryLink || prev === null) return prev;
          prev.text += ev.key;
          return prev;
        });
        resetCaret();
        draw(canvas, context, nodes, links, currentLink, theme, selectedObject, caretVisible, inCanvas, setJsonEditor);
        return true
      }
      return true
    }
  }

  useEffect(() => {
    setScreenRatio(screen.width / 2000);
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;
  }, []);

  useEffect(() => {
    document.addEventListener("keyup", onKeyUp)
    document.removeEventListener("keyup", onKeyUp)
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown)
    document.removeEventListener("keydown", onKeyDown)
  }, []);

  return (
    <div>
      <CanvasRefContext.Provider value={canvasRef}>
        <GraphBoard/>
        <IO/>
      </CanvasRefContext.Provider>
    </div>
  );
}
