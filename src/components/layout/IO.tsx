"use client"

import { useElementRef } from "@/common/refs";
import { obtainAdjacencyList } from "@/common/utilities";

export function IO() {

    const {stageRef, nodesRefs, linksRefs} = useElementRef();

    const saveAsLaTeX = (e: React.MouseEvent) => {
        console.error("saveAsLaTeX not implemented")
    }
    
    const saveAsPNG = (e: React.MouseEvent) => {
        if(stageRef.current === null) return;
        stageRef.current.toBlob({mimeType: 'image/png'}).then(blob => {
            navigator.clipboard.write([new ClipboardItem({'image/png': blob as Blob})])
        })
        console.log("PNG Copied to clipboard  \t\t😊")
    }

    const saveAsJson = (e: React.MouseEvent) => {
        const adjacencyList: Record<number, number[]> = obtainAdjacencyList(nodesRefs.current, linksRefs.current)
        navigator.clipboard.writeText(JSON.stringify(adjacencyList))
        console.log("JSON Copied to clipboard  \t\t😊")
    }

    return (<div style={{ marginLeft: '2rem', marginRight: '2rem' }} className="p-2">
    <div className="card-group">
        <div id="json-container" className="btn text-center card  bg-danger rounded card-upload border-0">
            <div className="card-body">
                <input id="json-upload" style={{display: "none"}} type="file"/>
    
                <h1 className="card-title text-white">JSON</h1>
                <p className="h-3 text-white">Upload your JSON</p>
            </div>
        </div>
        <div className="card btn text-center bg-warning rounded card-download border-0" onClick={saveAsLaTeX}>
            <div className="card-body">
                <h1 className="card-title text-white">LATEX</h1>
                <p className="h-3 text-white"> Copy to Clipboard</p>
            </div>
        </div>
        <div className="card btn text-center bg-primary rounded card-download border-0" onClick={saveAsPNG}>
            <div className="card-body">
                <h1 className="card-title text-white">PNG</h1>
                <p className="h-3 text-white "> Copy to Clipboard</p>
            </div>
        </div>
        <div className="card btn text-center bg-success rounded card-download border-0" onClick={saveAsJson}>
            <div className="card-body">
                <h1 className="card-title text-white">JSON</h1>
                <p className="h-3 text-white"> Copy to Clipboard</p>
            </div>
        </div>
    </div>
    </div>);
}