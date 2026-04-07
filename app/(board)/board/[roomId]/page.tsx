"use client";

import { RoomProvider, ClientSideSuspense } from "@liveblocks/react";
import PulseCanvas from "@/components/PulseCanvas";
import { use } from "react";

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
            initialStorage={{ elements: [] }}
        >
            <ClientSideSuspense fallback={<div>Connecting to room...</div>}>
                <PulseCanvas />
            </ClientSideSuspense>
        </RoomProvider>
    );
}