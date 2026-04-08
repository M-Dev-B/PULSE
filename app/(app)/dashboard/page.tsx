"use client";

import { useUser, RedirectToSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Plus, Users, LayoutDashboard, Trash2 } from "lucide-react"; 
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes"; // Import theme hook
import Navbar from '@/components/Navbar';
import Grainient from '@/components/Grainient'; // Ensure this path is correct

type Board = {
    id: string;
    title: string;
    updated: string;
    collaborators: number;
};

export default function Dashboard() {
    const { isLoaded, isSignedIn, user } = useUser();
    const router = useRouter();
    const { resolvedTheme } = useTheme();

    const [boards, setBoards] = useState<Board[]>([]);
    const [isLoadingBoards, setIsLoadingBoards] = useState(true);
    const [mounted, setMounted] = useState(false); // Hydration safety for theme

    useEffect(() => {
        setMounted(true);
        if (!user) return;
        const timer = setTimeout(() => {
            const savedBoards = localStorage.getItem(`pulse_boards_${user.id}`);
            if (savedBoards) {
                setBoards(JSON.parse(savedBoards));
            }
            setIsLoadingBoards(false);
        }, 0);
        return () => clearTimeout(timer);
    }, [user]);

    if (!isLoaded || !mounted) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-[#0B0C10]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    <p className="font-heading text-lg font-medium text-slate-500 dark:text-slate-400">Loading your workspace...</p>
                </div>
            </div>
        );
    }

    if (!isSignedIn) return <RedirectToSignIn />;

    const createNewBoard = () => {
        const uniqueRoomId = `room_${crypto.randomUUID()}`;
        const newBoard: Board = {
            id: uniqueRoomId,
            title: "Untitled Board",
            updated: new Date().toLocaleDateString(),
            collaborators: 1, 
        };

        const updatedBoards = [newBoard, ...boards];
        setBoards(updatedBoards);
        localStorage.setItem(`pulse_boards_${user?.id}`, JSON.stringify(updatedBoards));

        toast.success("New board created!");

        setTimeout(() => {
            router.push(`/board/${uniqueRoomId}`);
        }, 600);
    };

    const openBoard = (id: string) => {
        router.push(`/board/${id}`);
    };

    const deleteBoard = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const updatedBoards = boards.filter((board) => board.id !== id);
        setBoards(updatedBoards);
        localStorage.setItem(`pulse_boards_${user?.id}`, JSON.stringify(updatedBoards));
        toast.success("Board removed from dashboard");
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-transparent">
            
         {/* --- WEBGL BACKGROUND LAYER --- */}
            <div className="fixed inset-0 -z-10 w-full h-full">
                {resolvedTheme === 'dark' ? (
                    // YOUR REACT BITS CONFIGURATION (Dark Mode)
                    <Grainient 
                        color1="#8275e6"
                        color2="#000000"
                        color3="#000000"
                        timeSpeed={2.05}
                        colorBalance={0}
                        warpStrength={1}
                        warpFrequency={2.9}
                        warpSpeed={2}
                        warpAmplitude={50}
                        blendAngle={0}
                        blendSoftness={0.05}
                        rotationAmount={500}
                        noiseScale={2}
                        grainAmount={0.1}
                        grainScale={2}
                        grainAnimated={false}
                        contrast={1.5}
                        gamma={1}
                        saturation={1}
                        centerX={0}
                        centerY={0}
                        zoom={0.75}
                    />
                ) : (
                    // LIGHT MODE CONFIGURATION
                    <Grainient 
                        color1="#8275e6"
                        color2="#f8fafc"
                        color3="#cffafe"
                        timeSpeed={2.05}
                        colorBalance={0}
                        warpStrength={1}
                        warpFrequency={2.9}
                        warpSpeed={2}
                        warpAmplitude={50}
                        blendAngle={0}
                        blendSoftness={0.05}
                        rotationAmount={500}
                        noiseScale={2}
                        grainAmount={0.1}
                        grainScale={2}
                        grainAnimated={false}
                        contrast={1.5}
                        gamma={1}
                        saturation={1}
                        centerX={0}
                        centerY={0}
                        zoom={0.75}
                    />
                )}
                {/* Overlay to ensure text readability */}
                <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-[2px]"></div>
            </div>

            {/* --- CONTENT LAYER --- */}
            <main className="mx-auto container px-5 sm:px-10 py-6 relative z-10">
                <Navbar />
                
                <div className="flex flex-col md:flex-row items-start md:items-end justify-between mt-12 mb-10 gap-6">
                    <div>
                        <h1 className="font-heading text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
                            Your Boards
                        </h1>
                        <p className="text-slate-600 dark:text-slate-300 mt-3 text-lg">
                            Create, collaborate, and bring ideas to life with AI
                        </p>
                    </div>

                    <button 
                        onClick={createNewBoard}
                        className="relative inline-flex h-12 active:scale-95 transition-all items-center justify-center overflow-hidden rounded-full p-[1px] focus:outline-none shadow-lg"
                    >
                        <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3b82f6_0%,#8b5cf6_50%,#3b82f6_100%)]" />
                        <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white dark:bg-slate-950 px-6 py-1 text-sm font-medium text-slate-900 dark:text-white backdrop-blur-3xl gap-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900">
                            <Plus className="w-5 h-5" />
                            New Board
                        </span>
                    </button>
                </div>

                {/* Grid Content... (No changes needed below here) */}
                {isLoadingBoards ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 rounded-2xl bg-white/40 dark:bg-black/20 backdrop-blur-md animate-pulse border border-white/20 dark:border-white/5" />
                        ))}
                    </div>
                ) : boards.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {boards.map((board) => (
                            <div
                                key={board.id}
                                onClick={() => openBoard(board.id)}
                                className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/50 dark:border-white/10 bg-white/50 dark:bg-[#0B0C10]/40 p-4 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:border-blue-400/50 cursor-pointer shadow-sm"
                            >
                                <button 
                                    onClick={(e) => deleteBoard(e, board.id)}
                                    className="absolute top-6 right-6 z-20 p-2 rounded-full bg-white/70 dark:bg-black/50 text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-sm"
                                    title="Remove from Dashboard"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>

                                <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100/50 dark:bg-black/50 mb-4 border border-white/60 dark:border-white/5 group-hover:scale-[1.02] transition-transform duration-300">
                                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px]"></div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white/10 dark:bg-black/20 backdrop-blur-[2px]">
                                        <div className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 rounded-full font-medium text-sm shadow-lg flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all">
                                            <LayoutDashboard className="w-4 h-4" /> Open Board
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1 relative z-10">
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-1 pr-8">
                                        {board.title}
                                    </h3>
                                    
                                    <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400 mt-2">
                                        <p>Updated {board.updated}</p>
                                        <div className="flex items-center gap-1.5 bg-white/60 dark:bg-black/30 px-2.5 py-1 rounded-md border border-white/40 dark:border-white/5">
                                            <Users className="w-3.5 h-3.5" />
                                            <span className="font-medium">{board.collaborators}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center rounded-3xl border border-dashed border-slate-300 dark:border-white/10 bg-white/40 dark:bg-[#0B0C10]/40 backdrop-blur-md mt-10 shadow-sm">
                        {/* Empty state content remains the same */}
                        <div className="h-20 w-20 rounded-full bg-blue-100/80 dark:bg-blue-900/30 flex items-center justify-center mb-6 shadow-inner">
                            <span className="text-4xl">✨</span>
                        </div>
                        <h3 className="font-heading text-2xl font-bold text-slate-900 dark:text-white">No boards yet</h3>
                        <p className="text-slate-600 dark:text-slate-400 mt-3 max-w-sm text-base">
                            Create your first collaborative whiteboard and start drawing with teammates and AI.
                        </p>
                        <button 
                            onClick={createNewBoard}
                            className="mt-8 relative inline-flex h-12 active:scale-95 transition-all items-center justify-center overflow-hidden rounded-full p-[1px] focus:outline-none shadow-lg"
                        >
                            <span className="absolute inset-[-1000%] animate-[spin_3s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3b82f6_0%,#8b5cf6_50%,#3b82f6_100%)]" />
                            <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-white dark:bg-slate-950 px-8 py-1 text-sm font-medium text-slate-900 dark:text-white backdrop-blur-3xl gap-2 transition-colors hover:bg-slate-50 dark:hover:bg-slate-900">
                                <Plus className="w-5 h-5" />
                                Create Your First Board
                            </span>
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}