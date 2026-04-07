import { Liveblocks } from "@liveblocks/node";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const liveblocks = new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: Request) {
    // 1. Get the authenticated user from Clerk
    const user = await currentUser();

    if (!user) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Prepare the user's info for Pulse
    const userInfo = {
        id: user.id,
        info: {
            name: `${user.firstName} ${user.lastName}`.trim() || "Anonymous",
            avatar: user.imageUrl,
            color: `#${Math.floor(Math.random() * 16777215).toString(16)}`, // Random hex color
        },
    };

    // 3. Start a Liveblocks session
    const { room } = await request.json();
    const session = liveblocks.prepareSession(user.id, { userInfo: userInfo.info });

    // 4. Grant full access to this specific room
    session.allow(room, session.FULL_ACCESS);

    // 5. Authorize and return the token
    const { status, body } = await session.authorize();
    return new NextResponse(body, { status });
}