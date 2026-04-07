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

        // This is the "Identity" data that comes from your Auth endpoint
        UserMeta: {
            id: string; // The Clerk User ID
            info: {
                name: string;
                avatar: string;
                color: string; // Add a random color for their cursor!
            };
        };

        // Custom events
        // RoomEvent: {};
    }
}

export { };