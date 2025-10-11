"use client";

import { LinkGRef } from "@/classes/link";
import { NodeGRef } from "@/classes/node";
import { themeAtom } from "@/common/atoms";
import { ElementRefContext, OperationFlagsRefContext } from "@/common/refs";
import { DialogDemo } from "@/components/layout/ClearModal";
import { GraphBoard } from "@/components/layout/GraphBoard";
import { IO } from "@/components/layout/IO";
import NavigationBar from "@/components/layout/NavigationBar";
import { useAtomValue } from "jotai";
import Konva from "konva";
import { useEffect, useRef } from "react";

export default function Home() {
  const theme = useAtomValue(themeAtom);

  const stageRef = useRef<Konva.Stage | null>(null);

  const shiftRef = useRef<boolean>(false);
  const inCanvasRef = useRef<boolean>(false);
  const caretVisibleRef = useRef<boolean>(true);

  const nodesRefs = useRef<(NodeGRef | null)[]>([]);

  const linksRefs = useRef<(LinkGRef | null)[]>([]);

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("bg-dark", "text-light");
    } else {
      document.body.classList.remove("bg-dark", "text-light");
    }
  }, [theme]);

  return (
    <div>
      <NavigationBar />
      <ElementRefContext.Provider value={{ stageRef, nodesRefs, linksRefs }}>
        <OperationFlagsRefContext.Provider
          value={{ shiftRef, inCanvasRef, caretVisibleRef }}
        >
          <GraphBoard />
          <DialogDemo />
          <IO />
        </OperationFlagsRefContext.Provider>
      </ElementRefContext.Provider>
    </div>
  );
}
