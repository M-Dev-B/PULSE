import { LiveMap } from "@liveblocks/client";

declare global {
    interface Liveblocks {
        // Each user's Presence (e.g., cursor coordinates)
        Presence: {
            cursor: { x: number; y: number } | null;
        };

        // The Storage tree for the room, for useRoom, useStorage, etc.
        Storage: {
            elements: LiveMap<string, any>;
        };

        // Custom user info set when authenticating
        UserMeta: {
            id: string;
            info: {
                name?: string;
                avatar?: string;
            };
        };

        // Custom events
        // RoomEvent: {};
    }
}

export { };