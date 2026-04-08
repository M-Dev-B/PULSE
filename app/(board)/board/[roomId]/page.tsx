"use client";

import { RoomProvider, ClientSideSuspense } from "@liveblocks/react";
import PulseCanvas from "@/components/PulseCanvas";
import LiveSidebar from "@/components/LiveSidebar";
import { use, useMemo } from "react";
import { LiveMap } from "@liveblocks/client";

type Props = {
    params: Promise<{ roomId: string }>;
};

export default function BoardPage({ params }: Props) {
    const { roomId } = use(params);

    // Memoize initial storage to prevent unnecessary re-renders
    const initialStorage = useMemo(() => ({
        elements: new LiveMap()
    }), []);

    return (
        <RoomProvider
            id={roomId}
            initialPresence={{ cursor: null }}
            initialStorage={initialStorage}
        >
            <ClientSideSuspense 
                fallback={
                    <div className="fixed inset-0 flex flex-col items-center justify-center bg-background z-50">
                        <div className="animate-pulse text-2xl font-bold tracking-tighter">PULSE</div>
                        <p className="mt-2 text-muted-foreground animate-pulse">Connecting to workspace...</p>
                    </div>
                }
            >
                <div className="flex h-screen w-screen overflow-hidden bg-background">
                    <main className="flex-1 relative h-full">
                        <PulseCanvas />
                    </main>
                    <LiveSidebar />
                </div>
            </ClientSideSuspense>
        </RoomProvider>
    );
}