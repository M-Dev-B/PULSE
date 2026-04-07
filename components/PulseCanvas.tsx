"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useRoom } from "@liveblocks/react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const ExcalidrawWrapper = dynamic(
    () => import("./excalidraw-wrapper"),
    { ssr: false, loading: () => <div>Loading canvas...</div> }
);

export default function PulseCanvas() {
    const { theme } = useTheme();
    const excalidrawTheme = theme === "dark" ? "dark" : "light";
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const [isReady, setIsReady] = useState(false);
    const room = useRoom();
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const liveElementsMapRef = useRef<any>(null); // store reference to LiveMap

    useEffect(() => {
        let isMounted = true;

        async function initStorage() {
            try {
                // 1. Wait for storage to load
                const { root } = await room.getStorage();
                const liveElements = root.get("elements");
                liveElementsMapRef.current = liveElements;

                if (!isMounted) return;

                // 2. Initial data for Excalidraw – convert LiveMap to array
                const initialElements = Array.from(liveElements.values()) || [];

                // 3. Set up listener for remote changes
                const unsubscribe = room.subscribe(liveElements, () => {
                    if (!excalidrawAPI || !isMounted) return;
                    const newElements = Array.from(liveElements.values());
                    excalidrawAPI.updateScene({ elements: newElements });
                });

                // 4. Mark as ready to allow drawing
                setIsReady(true);

                // 5. Store cleanup
                return () => {
                    unsubscribe();
                };
            } catch (error) {
                console.error("Failed to load storage", error);
            }
        }

        initStorage();

        return () => {
            isMounted = false;
            if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        };
    }, [room, excalidrawAPI]);

    // Handle local changes -> sync to Liveblocks
    const handleChange = async (elements: readonly any[]) => {
        if (!isReady) return;

        // Debounce to avoid flooding
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(async () => {
            try {
                // Get the LiveMap reference (either from ref or fresh)
                let liveElements = liveElementsMapRef.current;
                if (!liveElements) {
                    const { root } = await room.getStorage();
                    liveElements = root.get("elements");
                    liveElementsMapRef.current = liveElements;
                }

                // Batch update: clear and set new elements
                room.batch(() => {
                    liveElements.clear();
                    for (const el of elements) {
                        liveElements.set(el.id, el);
                    }
                });
            } catch (error) {
                console.error("Failed to sync", error);
            }
        }, 100);
    };

    if (!isReady) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                Loading canvas...
            </div>
        );
    }

    return (
        <div className="h-screen w-screen">
            <ExcalidrawWrapper
                excalidrawAPI={setExcalidrawAPI}
                theme={excalidrawTheme}
                onChange={handleChange}
            />
        </div>
    );
}