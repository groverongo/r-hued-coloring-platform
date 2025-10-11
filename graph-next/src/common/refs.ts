import { LinkGRef } from "@/classes/link";
import { NodeGRef } from "@/classes/node";
import { Modal } from "bootstrap";
import { createContext, RefObject, useContext } from "react";
import { proxy } from "valtio";

export const ElementRefContext = createContext<{
    canvasRef: RefObject<HTMLCanvasElement | null>, 
    nodesRefs: RefObject<(NodeGRef | null)[]>,
    linksRefs: RefObject<(LinkGRef | null)[]>,
}>({
    canvasRef: {current: null}, 
    nodesRefs: {current: []},
    linksRefs: {current: []},
});

export const useElementRef = () => useContext(ElementRefContext);

export const OperationFlagsRefContext = createContext<{
    shiftRef: RefObject<boolean>, 
    inCanvasRef: RefObject<boolean>,
    caretVisibleRef: RefObject<boolean>
}>({
    shiftRef: {current: false},
    inCanvasRef: {current: false},
    caretVisibleRef: {current: true}
});

export const useOperationFlagsRef = () => useContext(OperationFlagsRefContext);