import { inCanvasAtom, inPanelAtom } from "@/common/atoms";
import { useSetAtom } from "jotai";
import { CSSProperties, MouseEventHandler } from "react";

export default function Panel(){

    const setInCanvas = useSetAtom(inCanvasAtom);
    const setInPanel = useSetAtom(inPanelAtom);

    const styleProps: CSSProperties = {
        width: `${400 * screen.width / 2000}px`
    }

    const onMouseDown: MouseEventHandler<HTMLDivElement> = (e) => {
        setInCanvas(false);
        setInPanel(true);
    }

    return (<div className="rounded bg-white shadow-lg" id="panel" style={styleProps} onMouseDown={onMouseDown}>
        <div id="jsoneditor"></div>
    </div>);
}