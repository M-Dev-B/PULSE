"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { useRoom, useUpdateMyPresence } from "@liveblocks/react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";

const ExcalidrawWrapper = dynamic(
    () => import("./excalidraw-wrapper"),
    { ssr: false, loading: () => <div className="flex h-screen items-center justify-center">Loading room storage...</div> }
);

export default function PulseCanvas() {
    const { theme } = useTheme();
    const excalidrawTheme = theme === "dark" ? "dark" : "light";

    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
    const [isStorageReady, setIsStorageReady] = useState(false);

    const room = useRoom();
    const updateMyPresence = useUpdateMyPresence();
    const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // 1. Initialize Storage FIRST
    useEffect(() => {
        let isMounted = true;
        async function prepareStorage() {
            try {
                await room.getStorage();
                if (isMounted) setIsStorageReady(true);
            } catch (error) {
                console.error("Failed to load storage", error);
            }
        }
        prepareStorage();
        return () => { isMounted = false; };
    }, [room]);

    // 2. Sync Remote Drawing (With Spatial Index Sorting)
    useEffect(() => {
        let isMounted = true;
        let unsubscribe: (() => void) | undefined;

        async function syncCanvas() {
            if (!isStorageReady || !excalidrawAPI) return;

            try {
                const { root } = await room.getStorage();
                const liveElements = root.get("elements");

                if (!isMounted) return;

                // HELPER: Sorts elements perfectly to prevent off-screen corruption
                const getSortedElements = () => {
                    return Array.from(liveElements.values()).sort((a: any, b: any) => {
                        const zA = a.zIndex ?? 0;
                        const zB = b.zIndex ?? 0;
                        // Secondary sort by ID guarantees identical ordering across all clients
                        if (zA === zB) return a.id.localeCompare(b.id);
                        return zA - zB;
                    });
                };

                // Initial load
                excalidrawAPI.updateScene({ elements: getSortedElements() });

                // Subscribe to future remote changes
                unsubscribe = room.subscribe(liveElements, () => {
                    if (!isMounted) return;
                    excalidrawAPI.updateScene({ elements: getSortedElements() });
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

    // 3. Sync Remote Cursors (Zero-Lag Native)
    useEffect(() => {
        if (!excalidrawAPI || !isStorageReady) return;

        const syncCollaborators = () => {
            const others = room.getOthers();
            const collaborators = new Map();

            for (const other of others) {
                // 'other.info' now contains the data from Clerk!
                if (other.presence?.cursor) {
                    collaborators.set(other.connectionId.toString(), {
                        pointer: other.presence.cursor,
                        button: "up",
                        selectedElementIds: {},
                        username: other.info?.name || "Anonymous", // ✅ Real Name
                        avatarUrl: other.info?.avatar,             // ✅ Real Avatar
                        color: other.info?.color || "#9b59b6",     // ✅ Custom Color
                    });
                }
            }

            excalidrawAPI.updateScene({ collaborators });
        };

        syncCollaborators();
        const unsubscribe = room.subscribe("others", syncCollaborators);

        return () => unsubscribe();
    }, [room, excalidrawAPI, isStorageReady]);

    // 4. Sync Local Drawing (Delta Sync with Z-Index Tracking)
    const handleChange = async (elements: readonly any[]) => {
        if (!isStorageReady) return;

        if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = setTimeout(async () => {
            try {
                const { root } = await room.getStorage();
                const liveElements = root.get("elements");

                room.batch(() => {
                    // Loop with `index` to track Excalidraw's strict ordering requirements
                    elements.forEach((el, index) => {
                        const existing = liveElements.get(el.id);

                        // Push to database if: 
                        // 1. It's new
                        // 2. It was modified (version increased)
                        // 3. Its Z-Index changed (e.g. user clicked "Bring to Front")
                        if (!existing || el.version > existing.version || existing.zIndex !== index) {
                            liveElements.set(el.id, { ...el, zIndex: index });
                        }
                    });
                });
            } catch (error) {
                console.error("Failed to sync", error);
            }
        }, 50);
    };

    // 5. Sync Local Cursor
    const handlePointerUpdate = (payload: { pointer: { x: number; y: number } }) => {
        updateMyPresence({ cursor: payload.pointer });
    };

    const handlePointerLeave = () => {
        updateMyPresence({ cursor: null });
    };

    if (!isStorageReady) {
        return (
            <div className="h-screen w-screen flex items-center justify-center">
                Loading room storage...
            </div>
        );
    }

    return (
        <div className="h-screen w-screen" onPointerLeave={handlePointerLeave}>
            <ExcalidrawWrapper
                excalidrawAPI={(api) => setExcalidrawAPI(api)}
                theme={excalidrawTheme}
                onChange={handleChange}
                onPointerUpdate={handlePointerUpdate}
            />
        </div>
    );
}