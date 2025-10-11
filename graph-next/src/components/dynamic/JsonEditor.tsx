import { screenRatioAtom } from "@/common/atoms";
import { useAtomValue } from "jotai";
import { CSSProperties } from "react";

// const OPTIONS: JSONEditorOptions = {
//     mode: "tree", mainMenuBar: false, statusBar: false, enableSort: false, enableTransform: false
// }

export default function GraphJsonEditor(){

    const valueScreenRatio = useAtomValue(screenRatioAtom);

    const STYLE_PROPS: CSSProperties = {
        width: `width:${400 * valueScreenRatio}px`
    }

    return (
        <div id="jsoneditor" style={STYLE_PROPS}>
        </div>
    );
}