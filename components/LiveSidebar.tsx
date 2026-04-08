"use client";

import { useState, useEffect, useRef } from "react";
import { useOthers, useSelf, useBroadcastEvent, useEventListener, useRoom } from "@liveblocks/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, Users, ChevronRight, Sparkles, Loader2, Bot } from "lucide-react";

type ChatMessage = {
    type: "CHAT_MESSAGE";
    text: string;
    sender: string;
};

export default function LiveSidebar({ onGenerate }: { onGenerate?: (elements: any[]) => void }) {
    const others = useOthers();
    const self = useSelf();
    const broadcast = useBroadcastEvent();
    const room = useRoom();
    
    // UI & Scroll Refs
    const [isOpen, setIsOpen] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    
    // Chat State
    const [msg, setMsg] = useState("");
    const [chatHistory, setChatHistory] = useState<{ sender: string; text: string }[]>([]);
    
    // AI States
    const [aiPrompt, setAiPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [isAiThinking, setIsAiThinking] = useState(false);

    // --- 1. AUTO-SCROLL LOGIC ---
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [chatHistory, isAiThinking]);

    // --- 2. LIVE CHAT LOGIC ---
    useEventListener(({ event }) => {
        const chatEvent = event as ChatMessage;
        if (chatEvent.type === "CHAT_MESSAGE") {
            setChatHistory((prev) => [...prev, { sender: chatEvent.sender, text: chatEvent.text }]);
        }
    });

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!msg.trim()) return;

        broadcast({ type: "CHAT_MESSAGE", text: msg, sender: self?.info?.name || "Me" });
        setChatHistory((prev) => [...prev, { sender: "Me", text: msg }]);
        setMsg("");
    };

    // --- 3. MAGIC WAND LOGIC (AI GENERATION) ---
    const handleMagicWand = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!aiPrompt.trim() || !onGenerate) return;
        setIsGenerating(true);

        try {
            const res = await fetch("/api/ai/generate", {
                method: "POST",
                body: JSON.stringify({ prompt: aiPrompt }),
            });
            
            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(`Server Error: ${errorData.error || "Failed to generate shapes"}`);
            }

            let skeletons = await res.json();
            
            if (!Array.isArray(skeletons)) {
                if (skeletons && skeletons.elements && Array.isArray(skeletons.elements)) {
                    skeletons = skeletons.elements;
                } else {
                    throw new TypeError("AI response is not an array format.");
                }
            }
            
            // Dynamic import for Excalidraw to fix SSR "window is not defined"
            const excalidrawModule = await import("@excalidraw/excalidraw");
            const fullElements = excalidrawModule.convertToExcalidrawElements(skeletons);
            
            onGenerate(fullElements);
            setAiPrompt("");
        } catch (error) {
            console.error("Magic Wand failed:", error);
        } finally {
            setIsGenerating(false);
        }
    };

    // --- 4. AI ARCHITECT LOGIC (BOARD ANALYSIS) ---
    const askAIArchitect = async () => {
        if (!msg.trim()) return;
        setIsAiThinking(true);

        const userQuestion = msg;
        broadcast({ type: "CHAT_MESSAGE", text: userQuestion, sender: self?.info?.name || "Me" });
        setChatHistory((prev) => [...prev, { sender: "Me", text: userQuestion }]);
        setMsg("");

        try {
            const { root } = await room.getStorage();
            const liveElements = root.get("elements");
            
            const simplifiedContext = Array.from(liveElements.values()).map((el: any) => ({
                type: el.type,
                x: Math.round(el.x),
                y: Math.round(el.y),
                text: el.text || (el.label ? el.label.text : "No text"),
            }));

            const res = await fetch("/api/ai/chat", {
                method: "POST",
                body: JSON.stringify({ prompt: userQuestion, boardContext: simplifiedContext }),
            });

            if (!res.ok) throw new Error("AI failed to respond");
            const data = await res.json();
            
            broadcast({ type: "CHAT_MESSAGE", text: data.reply, sender: "✨ Pulse AI" });
            setChatHistory((prev) => [...prev, { sender: "✨ Pulse AI", text: data.reply }]);
        } catch (error) {
            console.error("AI Architect failed:", error);
            setChatHistory((prev) => [...prev, { sender: "⚠️ System", text: "AI Architect Offline." }]);
        } finally {
            setIsAiThinking(false);
        }
    };

    return (
        <>
            {/* Floating Toggle Button */}
            <button 
                onClick={() => setIsOpen(true)}
                className={`fixed top-4 right-4 z-40 p-3.5 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-lg transition-all duration-300 hover:scale-105 ${
                    isOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
                }`}
            >
                <MessageSquare className="w-5 h-5" />
            </button>

            {/* Sidebar with Scroll Fix & Flex Layout */}
            <aside 
                className={`fixed top-0 right-0 z-50 h-screen w-80 bg-white/70 dark:bg-[#0B0C10]/80 backdrop-blur-2xl border-l border-slate-200 dark:border-white/10 shadow-2xl flex flex-col overflow-hidden transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header Section */}
                <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500">
                        <Users className="w-4 h-4" />
                        <span>ACTIVE NOW ({others.length + 1})</span>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Presence Avatars */}
                <div className="p-4 border-b border-slate-200 dark:border-white/10 flex -space-x-2 flex-shrink-0">
                    <Avatar className="border-2 border-white dark:border-[#0B0C10] w-10 h-10 ring-2 ring-blue-500 z-10">
                        <AvatarImage src={self?.info?.avatar} />
                        <AvatarFallback className="bg-slate-200 dark:bg-slate-800">{self?.info?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    {others.map(({ connectionId, info }) => (
                        <Avatar key={connectionId} className="border-2 border-white dark:border-[#0B0C10] w-10 h-10 transition-transform hover:-translate-y-1">
                            <AvatarImage src={info?.avatar} />
                            <AvatarFallback className="bg-slate-200 dark:bg-slate-800">{info?.name?.[0]}</AvatarFallback>
                        </Avatar>
                    ))}
                </div>

                {/* AI Magic Wand Section */}
                <div className="p-4 border-b border-slate-200 dark:border-white/10 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-900/10 dark:to-cyan-900/10 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-3 text-xs font-bold tracking-wider text-blue-600 dark:text-cyan-400">
                        <Sparkles className="w-4 h-4" />
                        <span>AI MAGIC WAND</span>
                    </div>
                    <form onSubmit={handleMagicWand} className="space-y-3">
                        <Input 
                            placeholder="Describe what to draw..." 
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            disabled={isGenerating}
                            className="bg-white/80 dark:bg-black/50 border-slate-200 dark:border-white/20 shadow-inner text-sm h-10"
                        />
                        <button 
                            type="submit" 
                            disabled={isGenerating || !aiPrompt.trim()}
                            className="w-full py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-md shadow-md transition-all active:scale-95"
                        >
                            {isGenerating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Generate Shapes"}
                        </button>
                    </form>
                </div>

                {/* Live Chat & Architect Area */}
                <div className="flex-1 flex flex-col min-h-0 bg-white/30 dark:bg-black/20">
                    <div className="px-4 py-3 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 flex-shrink-0">
                        <MessageSquare className="w-4 h-4" />
                        <span>LIVE CHAT</span>
                    </div>
                    
                    {/* scrollRef is attached to the bottom inside this area */}
                    <ScrollArea className="flex-1 px-4 w-full h-full">
                        <div className="space-y-4 pb-4">
                            {chatHistory.map((chat, i) => (
                                <div key={i} className={`flex flex-col ${chat.sender === "Me" ? "items-end" : "items-start"}`}>
                                    <span className="text-[10px] text-slate-400 mb-1 font-medium">{chat.sender}</span>
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] shadow-sm ${
                                        chat.sender === "Me" 
                                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-tr-sm" 
                                        : chat.sender === "✨ Pulse AI"
                                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-tl-sm shadow-md shadow-purple-500/20"
                                        : "bg-white dark:bg-white/10 text-slate-800 dark:text-white border border-slate-100 dark:border-transparent rounded-tl-sm"
                                    }`}>
                                        {chat.text}
                                    </div>
                                </div>
                            ))}
                            {isAiThinking && (
                                <div className="flex flex-col items-start animate-pulse">
                                    <span className="text-[10px] text-slate-400 mb-1 font-medium">✨ Pulse AI</span>
                                    <div className="px-4 py-2.5 rounded-2xl text-sm bg-indigo-500/20 text-indigo-500 border border-indigo-500/30 flex items-center gap-2">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        <span>Architect is analyzing...</span>
                                    </div>
                                </div>
                            )}
                            {/* Anchor for Auto-Scroll */}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>
                </div>

                {/* Message & AI Architect Input Section */}
                <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-white/50 dark:bg-transparent flex-shrink-0">
                    <div className="flex items-center gap-2">
                        <form onSubmit={sendMessage} className="relative flex-1 flex items-center">
                            <Input 
                                placeholder="Chat, or ask AI..." 
                                value={msg}
                                onChange={(e) => setMsg(e.target.value)}
                                disabled={isAiThinking}
                                className="pr-12 rounded-full bg-white dark:bg-black/50 border-slate-200 dark:border-white/20 focus-visible:ring-blue-500 shadow-inner h-11"
                            />
                            <button 
                                type="submit" 
                                disabled={!msg.trim() || isAiThinking}
                                className="absolute right-1.5 p-2 rounded-full text-blue-500 disabled:opacity-50"
                                title="Send message"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                        
                        <button
                            type="button"
                            onClick={askAIArchitect}
                            disabled={!msg.trim() || isAiThinking}
                            className="p-3 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md hover:scale-105 disabled:opacity-50 transition-all flex-shrink-0"
                            title="Ask AI Architect"
                        >
                            <Bot className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}