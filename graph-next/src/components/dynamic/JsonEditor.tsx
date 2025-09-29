import { jsonEditorAtom, screenRatioAtom } from "@/common/atoms"
import { useAtom, useAtomValue } from "jotai"
import { JsonEditor } from "json-edit-react"
import { CSSProperties } from "react"

// const OPTIONS: JSONEditorOptions = {
//     mode: "tree", mainMenuBar: false, statusBar: false, enableSort: false, enableTransform: false
// }

export default function GraphJsonEditor(){

    const [valueJsonEditor, setJsonEditor] = useAtom(jsonEditorAtom);
    const valueScreenRatio = useAtomValue(screenRatioAtom);

    const STYLE_PROPS: CSSProperties = {
        width: `width:${400 * valueScreenRatio}px`
    }

    return (
        <div id="jsoneditor" style={STYLE_PROPS}>
            <JsonEditor
                data={valueJsonEditor} 
                setData={(data) => setJsonEditor(data as object)}
            />
        </div>
    );
}