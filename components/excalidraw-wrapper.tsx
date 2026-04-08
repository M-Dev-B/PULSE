"use client";

import { Excalidraw } from "@excalidraw/excalidraw";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";

interface ExcalidrawWrapperProps {
    theme?: "light" | "dark";        
    onChange?: (elements: readonly any[]) => void; 
    onPointerUpdate?: (payload: { pointer: { x: number; y: number } }) => void;
    initialData?: any;
    excalidrawAPI?: (api: ExcalidrawImperativeAPI) => void;
}

export default function ExcalidrawWrapper({ excalidrawAPI, ...props }: ExcalidrawWrapperProps) {
    return <Excalidraw excalidrawAPI={excalidrawAPI} {...props} />;
}