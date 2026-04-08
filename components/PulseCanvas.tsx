"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useRoom, useUpdateMyPresence } from "@liveblocks/react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

// Excalidraw loading state
const ExcalidrawWrapper = dynamic(
    () => import("./excalidraw-wrapper"),
    { 
        ssr: false, 
        loading: () => (
            <div className="h-full w-full flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        ) 
    }
);

export default function PulseCanvas() {
    const { theme } = useTheme();
    const excalidrawTheme = theme === "dark" ? "dark" : "light";
    
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const room = useRoom();
    const updateMyPresence = useUpdateMyPresence();
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 1. Sync Remote Drawing & Cursors
    useEffect(() => {
        let isMounted = true;
        let unsubscribeElements: (() => void) | undefined;
        let unsubscribeOthers: (() => void) | undefined;

        async function startSync() {
            const { root } = await room.getStorage();
            const liveElements = root.get("elements");
            if (!isMounted || !excalidrawAPI) return;

            // Initial Load
            const initialElements = Array.from(liveElements.values()).sort((a: any, b: any) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
            excalidrawAPI.updateScene({ elements: initialElements });

            // Listen for Remote Changes
            unsubscribeElements = room.subscribe(liveElements, () => {
                if (!isMounted) return;
                const newElements = Array.from(liveElements.values()).sort((a: any, b: any) => (a.zIndex ?? 0) - (b.zIndex ?? 0));
                excalidrawAPI.updateScene({ elements: newElements });
            });

            // Listen for Remote Cursors
            unsubscribeOthers = room.subscribe("others", () => {
                if (!isMounted) return;
                const others = room.getOthers();
                const collaborators = new Map();
                others.forEach((other) => {
                    if (other.presence?.cursor) {
                        collaborators.set(other.connectionId.toString(), {
                            pointer: other.presence.cursor,
                            username: other.info?.name || "Anonymous",
                            avatarUrl: other.info?.avatar,
                            color: other.info?.color,
                        });
                    }
                });
                excalidrawAPI.updateScene({ collaborators });
            });
        }

        startSync();

        return () => {
            isMounted = false;
            if (unsubscribeElements) unsubscribeElements();
            if (unsubscribeOthers) unsubscribeOthers();
        };
    }, [excalidrawAPI, room]);

    // 2. Sync Local Drawing
    const handleChange = (elements: readonly any[]) => {
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(async () => {
            const { root } = await room.getStorage();
            const liveElements = root.get("elements");

            room.batch(() => {
                elements.forEach((el, index) => {
                    const existing = liveElements.get(el.id);
                    if (!existing || el.version > existing.version || existing.zIndex !== index) {
                        liveElements.set(el.id, { ...el, zIndex: index });
                    }
                });
            });
        }, 50); 
    };

    return (
        <div 
            className="h-full w-full relative" 
            onPointerMove={(e) => updateMyPresence({ cursor: { x: e.clientX, y: e.clientY } })}
            onPointerLeave={() => updateMyPresence({ cursor: null })}
        >
            <ExcalidrawWrapper
                excalidrawAPI={(api) => setExcalidrawAPI(api)}
                theme={excalidrawTheme}
                onChange={handleChange}
            />
        </div>
    );
}