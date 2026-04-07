"use client";

import { RoomProvider, ClientSideSuspense } from "@liveblocks/react";
import PulseCanvas from "@/components/PulseCanvas";
import { use } from "react";
import { LiveMap } from "@liveblocks/client"; // ✅ Import LiveMap

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
            initialStorage={{ elements: new LiveMap() }} // ✅ Initialize as LiveMap
        >
            <ClientSideSuspense fallback={<div className="flex h-screen items-center justify-center">Connecting to room...</div>}>
                <PulseCanvas />
            </ClientSideSuspense>
        </RoomProvider>
    );
}