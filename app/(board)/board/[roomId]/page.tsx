"use client";

import { RoomProvider, ClientSideSuspense } from "@liveblocks/react";
import PulseCanvas from "@/components/PulseCanvas";
import LiveSidebar from "@/components/LiveSidebar"; 
import { use } from "react";
import { LiveMap } from "@liveblocks/client";

type Props = {
    params: Promise<{ roomId: string }>;
};

export default function BoardPage({ params }: Props) {
    const { roomId } = use(params);

    return (
        <RoomProvider
            id={roomId}
            initialPresence={{ cursor: null }}
            initialStorage={{ elements: new LiveMap() }}
        >
            <ClientSideSuspense fallback={<div className="flex h-screen w-screen items-center justify-center">Connecting to Pulse...</div>}>
                <div className="relative h-screen w-screen overflow-hidden bg-slate-50 dark:bg-[#0B0C10]">
                    
                    {/* UPDATED: Added w-full h-full flex to enforce strict dimensions */}
                    <main className="absolute inset-0 z-0 w-full h-full flex">
                        <PulseCanvas />
                    </main>
                    
                    <LiveSidebar />
                </div>
            </ClientSideSuspense>
        </RoomProvider>
    );
}