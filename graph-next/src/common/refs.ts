import { Modal } from "bootstrap";
import { createContext, RefObject, useContext } from "react";

export const ElementRefContext = createContext<{
    canvasRef: RefObject<HTMLCanvasElement | null>, 
}>({
    canvasRef: {current: null}, 
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