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
    const liveListRef = useRef<any>(null);

    useEffect(() => {
        let isMounted = true;

        async function initStorage() {
            try {
                const { root } = await room.getStorage();
                const liveElements = root.get("elements"); // Should be a LiveList
                liveListRef.current = liveElements;

                if (!isMounted) return;

                // Initial elements from LiveList
                const initialElements = liveElements.toArray() || [];

                // Apply initial data if API is ready
                if (excalidrawAPI) {
                    excalidrawAPI.updateScene({ elements: initialElements });
                }

                // Subscribe to changes on the LiveList
                const unsubscribe = room.subscribe(liveElements, () => {
                    if (!excalidrawAPI || !isMounted) return;
                    const newElements = liveElements.toArray();
                    excalidrawAPI.updateScene({ elements: newElements });
                });

                setIsReady(true);

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

    // Sync local changes to Liveblocks
    const handleChange = async (elements: readonly any[]) => {
        if (!isReady) return;

        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(async () => {
            try {
                let liveElements = liveListRef.current;
                if (!liveElements) {
                    const { root } = await room.getStorage();
                    liveElements = root.get("elements");
                    liveListRef.current = liveElements;
                }

                room.batch(() => {
                    // Clear and push new elements (replace entire list)
                    liveElements.clear();
                    for (const el of elements) {
                        liveElements.push(el);
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