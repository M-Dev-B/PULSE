import { LiveMap } from "@liveblocks/client";

declare global {
    interface Liveblocks {
        Presence: {
            cursor: { x: number; y: number } | null;
        };
        Storage: {
            elements: LiveMap<string, any>;
        };

        UserMeta: {
            id: string; 
            info: {
                name: string;
                avatar: string;
                color: string; 
            };
        };

    }
}

export { };