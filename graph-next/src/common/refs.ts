import { createContext, RefObject, useContext } from "react";

export const CanvasRefContext = createContext<RefObject<HTMLCanvasElement | null>>({current: null});

export const useCanvasRef = () => useContext(CanvasRefContext);
