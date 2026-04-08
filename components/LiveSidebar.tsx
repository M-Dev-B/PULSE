"use client";

import { useState } from "react";
import { useOthers, useSelf, useBroadcastEvent, useEventListener } from "@liveblocks/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, Users, ChevronRight } from "lucide-react";

type ChatMessage = {
    type: "CHAT_MESSAGE";
    text: string;
    sender: string;
};

export default function LiveSidebar() {
    const others = useOthers();
    const self = useSelf();
    const broadcast = useBroadcastEvent();
    
    const [msg, setMsg] = useState("");
    const [chatHistory, setChatHistory] = useState<{ sender: string; text: string }[]>([]);
    
    // NEW: Toggle state for the sidebar
    const [isOpen, setIsOpen] = useState(false);

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

    return (
        <>
            {/* Floating Toggle Button (Visible when sidebar is closed) */}
            <button 
                onClick={() => setIsOpen(true)}
                className={`absolute top-4 right-4 z-40 p-3.5 rounded-full bg-white/80 dark:bg-black/60 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white dark:hover:bg-black/80 ${
                    isOpen ? 'opacity-0 pointer-events-none translate-x-10' : 'opacity-100 translate-x-0'
                }`}
                title="Open Chat & Users"
            >
                <MessageSquare className="w-5 h-5 text-slate-800 dark:text-white" />
            </button>

            {/* Sliding Glassmorphic Sidebar Panel */}
            <aside 
                className={`absolute top-0 right-0 z-50 h-full w-80 bg-white/70 dark:bg-[#0B0C10]/80 backdrop-blur-2xl border-l border-slate-200 dark:border-white/10 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
                    isOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                {/* Header Section */}
                <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400">
                        <Users className="w-4 h-4" />
                        <span>ACTIVE NOW ({others.length + 1})</span>
                    </div>
                    {/* Close Button */}
                    <button 
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Avatars */}
                <div className="p-4 border-b border-slate-200 dark:border-white/10 flex -space-x-2 overflow-hidden">
                    <Avatar className="border-2 border-white dark:border-[#0B0C10] w-10 h-10 ring-2 ring-blue-500 z-10">
                        <AvatarImage src={self?.info?.avatar} />
                        <AvatarFallback className="bg-slate-200 dark:bg-slate-800">{self?.info?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    {others.map(({ connectionId, info }) => (
                        <Avatar key={connectionId} className="border-2 border-white dark:border-[#0B0C10] w-10 h-10 transition-transform hover:-translate-y-1 hover:z-20">
                            <AvatarImage src={info?.avatar} />
                            <AvatarFallback className="bg-slate-200 dark:bg-slate-800">{info?.name?.[0]}</AvatarFallback>
                        </Avatar>
                    ))}
                </div>

                {/* Chat History Section */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="px-4 py-3 flex items-center gap-2 text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400">
                        <MessageSquare className="w-4 h-4" />
                        <span>LIVE CHAT</span>
                    </div>
                    <ScrollArea className="flex-1 px-4">
                        <div className="space-y-4 pb-4">
                            {chatHistory.map((chat, i) => (
                                <div key={i} className={`flex flex-col ${chat.sender === "Me" ? "items-end" : "items-start"}`}>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mb-1 ml-1 pr-1 font-medium">{chat.sender}</span>
                                    <div className={`px-4 py-2.5 rounded-2xl text-sm max-w-[85%] shadow-sm ${
                                        chat.sender === "Me" 
                                        ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-tr-sm" 
                                        : "bg-white dark:bg-white/10 text-slate-800 dark:text-white border border-slate-100 dark:border-transparent rounded-tl-sm"
                                    }`}>
                                        {chat.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-white/50 dark:bg-transparent">
                    <form onSubmit={sendMessage} className="relative flex items-center">
                        <Input 
                            placeholder="Type a message..." 
                            value={msg}
                            onChange={(e) => setMsg(e.target.value)}
                            className="pr-12 rounded-full bg-white dark:bg-black/50 border-slate-200 dark:border-white/20 focus-visible:ring-blue-500 shadow-inner h-11"
                        />
                        <button 
                            type="submit" 
                            disabled={!msg.trim()}
                            className="absolute right-1.5 p-2 rounded-full text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/20 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}