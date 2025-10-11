import { useOperationFlagsRef } from "@/common/refs";
import { useSetAtom } from "jotai";
import { CSSProperties, MouseEventHandler, useState } from "react";

export default function Panel(){

    const {inCanvasRef} = useOperationFlagsRef();
    const [inPanel, setInPanel] = useState(false);

    const styleProps: CSSProperties = {
        width: `${400 * screen.width / 2000}px`
    }

    const onMouseDown: MouseEventHandler<HTMLDivElement> = (e) => {
        inCanvasRef.current = false;
        setInPanel(true);
    }

    return (<div className="rounded bg-white shadow-lg" id="panel" style={styleProps} onMouseDown={onMouseDown}>
        <div id="jsoneditor"></div>
    </div>);
}