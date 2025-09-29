"use client"

import { useEffect, useRef } from "react";
import Canvas from "../dynamic/Canvas";

export function GraphBoard() {
    return (
        <div id="board">
            <Canvas/>
        </div>
    );
}