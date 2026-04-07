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
                <div className="flex h-screen w-screen overflow-hidden">
                    {/* The Canvas takes up the remaining space */}
                    <main className="flex-1 relative">
                        <PulseCanvas />
                    </main>
                    
                    {/* The Sidebar (Fixed width) */}
                    <LiveSidebar />
                </div>
            </ClientSideSuspense>
        </RoomProvider>
    );
}