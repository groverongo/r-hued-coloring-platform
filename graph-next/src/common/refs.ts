import { createContext, Ref, RefObject, useContext } from "react";

export const CanvasRefContext = createContext<RefObject<HTMLCanvasElement | null>>({current: null});

export const useCanvasRef = () => useContext(CanvasRefContext);

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