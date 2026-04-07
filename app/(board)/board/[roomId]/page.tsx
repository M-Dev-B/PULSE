"use client";

import { RoomProvider, ClientSideSuspense } from "@liveblocks/react";
import PulseCanvas from "@/components/PulseCanvas";
import { use } from "react";
import { LiveMap } from "@liveblocks/client"; // ✅ Added LiveMap import

type Props = {
    params: Promise<{
        roomId: string;
    }>;
};

export default function BoardPage({ params }: Props) {
    const { roomId } = use(params);

    return (
        <RoomProvider
            id={roomId}
            initialPresence={{ cursor: null }} // ✅ Fixes the TypeScript error
            initialStorage={{ elements: new LiveMap() }} // ✅ Ensures storage uses LiveMap, not an array
        >
            <ClientSideSuspense fallback={<div className="flex h-screen w-screen items-center justify-center">Connecting to room...</div>}>
                <PulseCanvas />
            </ClientSideSuspense>
        </RoomProvider>
    );
}