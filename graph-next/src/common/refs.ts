import { LinkGRef } from "@/classes/link";
import { NodeGRef } from "@/classes/node";
import { Modal } from "bootstrap";
import Konva from "konva";
import { createContext, RefObject, useContext } from "react";
import { proxy } from "valtio";

export const ElementRefContext = createContext<{
    stageRef: RefObject<Konva.Stage | null>, 
    nodesRefs: RefObject<(NodeGRef | null)[]>,
    linksRefs: RefObject<(LinkGRef | null)[]>,
}>({
    stageRef: {current: null}, 
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