"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useRoom } from "@liveblocks/react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

// Dynamically import Excalidraw to prevent SSR issues
const ExcalidrawWrapper = dynamic(
    () => import("./excalidraw-wrapper"),
    { ssr: false, loading: () => <div className="flex h-screen items-center justify-center">Loading Excalidraw...</div> }
);

export default function PulseCanvas() {
    const { theme } = useTheme();
    const excalidrawTheme = theme === "dark" ? "dark" : "light";
    
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const [isStorageReady, setIsStorageReady] = useState(false);
    
    const room = useRoom();
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 1. Initialize Liveblocks Storage FIRST
    useEffect(() => {
        let isMounted = true;
        
        async function prepareStorage() {
            try {
                // Just wait for the storage to be accessible
                await room.getStorage();
                if (isMounted) setIsStorageReady(true);
            } catch (error) {
                console.error("Failed to load storage", error);
            }
        }
        
        prepareStorage();
        
        return () => { isMounted = false; };
    }, [room]);

    // 2. Connect Storage and Canvas once BOTH are ready
    useEffect(() => {
        let isMounted = true;
        let unsubscribe: (() => void) | undefined;

        async function syncCanvas() {
            // Wait until the deadlock is cleared (storage is ready AND canvas has rendered)
            if (!isStorageReady || !excalidrawAPI) return;

            try {
                const { root } = await room.getStorage();
                const liveElements = root.get("elements");

                if (!isMounted) return;

                // Load initial data from Liveblocks into Excalidraw
                const initialElements = Array.from(liveElements.values());
                excalidrawAPI.updateScene({ elements: initialElements });

                // Subscribe to remote changes from other users
                unsubscribe = room.subscribe(liveElements, () => {
                    if (!isMounted) return;
                    const newElements = Array.from(liveElements.values());
                    excalidrawAPI.updateScene({ elements: newElements });
                });
            } catch (error) {
                console.error("Failed to sync canvas", error);
            }
        }

        syncCanvas();

        return () => {
            isMounted = false;
            if (unsubscribe) unsubscribe();
        };
    }, [isStorageReady, excalidrawAPI, room]);

    // 3. Sync local Excalidraw changes back to Liveblocks
    const handleChange = async (elements: readonly any[]) => {
        if (!isStorageReady) return;

        // Debounce by 100ms to keep performance smooth and avoid flooding the websocket
        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        
        syncTimeoutRef.current = setTimeout(async () => {
            try {
                const { root } = await room.getStorage();
                const liveElements = root.get("elements");

                room.batch(() => {
                    // Create a fast lookup Set of current element IDs on the canvas
                    const currentIds = new Set(elements.map((el) => el.id));

                    // Step A: Remove elements from Liveblocks that were deleted on the canvas
                    for (const key of Array.from(liveElements.keys())) {
                        if (!currentIds.has(key)) {
                            liveElements.delete(key);
                        }
                    }

                    // Step B: Add new elements or update existing ones in Liveblocks
                    for (const el of elements) {
                        liveElements.set(el.id, el);
                    }
                });
            } catch (error) {
                console.error("Failed to sync", error);
            }
        }, 100); 
    };

    // If storage isn't ready, show the loader. Excalidraw handles its own loading state.
    if (!isStorageReady) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                Loading room storage...
            </div>
        );
    }

    return (
        <div className="h-screen w-screen">
            <ExcalidrawWrapper
                excalidrawAPI={(api) => setExcalidrawAPI(api)}
                theme={excalidrawTheme}
                onChange={handleChange}
            />
        </div>
    );
}