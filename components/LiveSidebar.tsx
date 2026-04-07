"use client";

import { useState } from "react";
import { useOthers, useSelf, useBroadcastEvent, useEventListener } from "@liveblocks/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, Users } from "lucide-react";

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

    // 1. Listen for incoming messages from others
    useEventListener(({ event }) => {
        const chatEvent = event as ChatMessage;
        if (chatEvent.type === "CHAT_MESSAGE") {
            setChatHistory((prev) => [...prev, { sender: chatEvent.sender, text: chatEvent.text }]);
        }
    });

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!msg.trim()) return;

        // 2. Broadcast to everyone else
        broadcast({ type: "CHAT_MESSAGE", text: msg, sender: self?.info?.name || "Me" });
        
        // 3. Add to my own local history
        setChatHistory((prev) => [...prev, { sender: "Me", text: msg }]);
        setMsg("");
    };

    return (
        <aside className="w-80 border-l bg-background flex flex-col h-full shadow-xl z-20">
            {/* Active Users Section */}
            <div className="p-4 border-b">
                <div className="flex items-center gap-2 mb-4 text-sm font-semibold text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>ACTIVE NOW ({others.length + 1})</span>
                </div>
                <div className="flex -space-x-2 overflow-hidden">
                    {/* You */}
                    <Avatar className="border-2 border-background w-10 h-10 ring-2 ring-primary">
                        <AvatarImage src={self?.info?.avatar} />
                        <AvatarFallback>{self?.info?.name?.[0]}</AvatarFallback>
                    </Avatar>
                    {/* Others */}
                    {others.map(({ connectionId, info }) => (
                        <Avatar key={connectionId} className="border-2 border-background w-10 h-10">
                            <AvatarImage src={info?.avatar} />
                            <AvatarFallback>{info?.name?.[0]}</AvatarFallback>
                        </Avatar>
                    ))}
                </div>
            </div>

            {/* Chat History Section */}
            <div className="flex-1 flex flex-col min-h-0">
                <div className="p-4 flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <MessageSquare className="w-4 h-4" />
                    <span>LIVE CHAT</span>
                </div>
                <ScrollArea className="flex-1 px-4">
                    <div className="space-y-4 pb-4">
                        {chatHistory.map((chat, i) => (
                            <div key={i} className={`flex flex-col ${chat.sender === "Me" ? "items-end" : "items-start"}`}>
                                <span className="text-[10px] text-muted-foreground mb-1">{chat.sender}</span>
                                <div className={`px-3 py-2 rounded-2xl text-sm max-w-[80%] ${
                                    chat.sender === "Me" 
                                    ? "bg-primary text-primary-foreground rounded-tr-none" 
                                    : "bg-muted rounded-tl-none"
                                }`}>
                                    {chat.text}
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t">
                <form onSubmit={sendMessage} className="relative">
                    <Input 
                        placeholder="Type a message..." 
                        value={msg}
                        onChange={(e) => setMsg(e.target.value)}
                        className="pr-10 rounded-full"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:scale-110 transition-transform">
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </aside>
    );
}