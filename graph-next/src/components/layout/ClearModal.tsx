import { currentLinkAtom, linksAtom, nodesAtom, themeAtom } from "@/common/atoms";
import { useOperationFlagsRef } from "@/common/refs";
import { useAtom, useAtomValue } from "jotai";
import { MouseEventHandler } from "react";

export default function ClearModal(){

    const [nodes, setNodes] = useAtom(nodesAtom);
    const [links, setlinks] = useAtom(linksAtom);
    const currentLink = useAtomValue(currentLinkAtom);
    const theme = useAtomValue(themeAtom);
    const {inCanvasRef} = useOperationFlagsRef();

    function clearCanvas(){
        setNodes([]);
        setlinks([]);
        // draw(undefined, undefined, nodes, links, currentLink, theme, selectedObjectAtom, caretVisibleAtom, inCanvas)
    }

    const clearCanvasDismiss: MouseEventHandler<HTMLButtonElement> = (e) => {
        // confirmWindow.hide()
    }
    
    const clearCanvasConfirm: MouseEventHandler<HTMLButtonElement> = (e) => {
        clearCanvas();
        // confirmWindow.hide()
    }

    return (
        <div className="modal fade" id="confirmWindow" tabIndex={-1} aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title text-primary" id="exampleModalLabel">Clear the canvas?</h5>
                    </div>
                    <div className="modal-body" style={{direction: "rtl"}}>
                        <button type="button" className="btn btn-success m-1" data-bs-dismiss="modal"
                                onClick={clearCanvasConfirm}>Yes
                        </button>
                        <button type="button" className="btn btn-danger m-1" onClick={clearCanvasDismiss}>No</button>
                    </div>
                </div>
            </div>
        </div>
    )
}