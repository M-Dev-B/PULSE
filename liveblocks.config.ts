// liveblocks.config.ts
import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
    publicApiKey: process.env.NEXT_PUBLIC_LIVEBLOCKS_PUBLIC_KEY!,
});

type Presence = {};

type Storage = {
    elements: any[]; // Excalidraw elements
};

export const { RoomProvider, useStorage, useMutation } = createRoomContext<Presence, Storage>(client);