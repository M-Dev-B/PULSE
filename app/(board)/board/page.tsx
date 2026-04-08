import { redirect } from "next/navigation";

/**
 * Pulse Root Board Redirect
 * This server component catches anyone visiting /board 
 * and instantly pushes them to the /board/test room.
 */
export default function BoardRootPage() {
    redirect("/board/test");
}