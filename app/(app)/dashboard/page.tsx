"use client";

import { useUser, RedirectToSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function Dashboard() {
    const { isLoaded, isSignedIn, user } = useUser();
    const router = useRouter();

    const [boards, setBoards] = useState([
        {
            id: "demo-1",
            title: "Landing Page Wireframe",
            updated: "2 hours ago",
            collaborators: 3,
        },
        {
            id: "demo-2",
            title: "Mobile App User Flow",
            updated: "Yesterday",
            collaborators: 2,
        },
        {
            id: "demo-3",
            title: "Chandigarh Startup Pitch Deck",
            updated: "3 days ago",
            collaborators: 5,
        },
    ]);

    // Protect the page
    if (!isLoaded) {
        return (
            <div className="flex h-screen items-center justify-center">
                Loading...
            </div>
        );
    }

    if (!isSignedIn) {
        return <RedirectToSignIn />;
    }

    const createNewBoard = () => {
        const newBoard = {
            id: `board-${Date.now()}`,
            title: "Untitled Board",
            updated: "Just now",
            collaborators: 1,
        };

        setBoards([newBoard, ...boards]);
        toast.success("New board created!");

        // Navigate using router (correct way)
        setTimeout(() => {
            router.push(`/board/${newBoard.id}`);
        }, 600);
    };

    const openBoard = (id: string) => {
        router.push(`/board/${id}`);
    };

    return (
        <div className="min-h-screen bg-background">
            <main className="mx-auto container px-5 sm:px-10 py-10">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <h1 className="text-5xl font-semibold tracking-tighter">
                            Your Boards
                        </h1>
                        <p className="text-muted-foreground mt-3 text-lg">
                            Create, collaborate, and bring ideas to life with AI
                        </p>
                    </div>

                    <Button
                        onClick={createNewBoard}
                        size="lg"
                        className="gap-2 text-base"
                    >
                        <Plus className="w-5 h-5" />
                        New Board
                    </Button>
                </div>

                {/* Boards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {boards.map((board) => (
                        <div
                            key={board.id}
                            className="board-card cursor-pointer group"
                            onClick={() => openBoard(board.id)}
                        >
                            <div className="board-preview group-hover:scale-105" />

                            <CardHeader className="px-0 pt-5 pb-3">
                                <CardTitle className="text-lg font-medium line-clamp-1">
                                    {board.title}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="px-0 flex items-center justify-between text-sm text-muted-foreground">
                                <p>Updated {board.updated}</p>
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{board.collaborators}</span>
                                </div>
                            </CardContent>
                        </div>
                    ))}
                </div>

                {boards.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="text-7xl mb-6">🎨</div>
                        <h3 className="text-3xl font-semibold">No boards yet</h3>
                        <p className="text-muted-foreground mt-3 max-w-sm">
                            Create your first collaborative whiteboard and start drawing with
                            teammates and AI.
                        </p>
                        <Button
                            onClick={createNewBoard}
                            className="mt-8 gap-2"
                            size="lg"
                        >
                            <Plus className="w-5 h-5" />
                            Create Your First Board
                        </Button>
                    </div>
                )}
            </main>
        </div>
    );
}