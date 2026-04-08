import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `
You are the "Pulse AI Architect", an expert system integrated into a collaborative whiteboard.
The user will provide you with a question, alongside a JSON array of the current shapes and text on their whiteboard.
Analyze the spatial relationships (x, y coordinates) and the text within the shapes to understand what they are building (e.g., a flowchart, architecture diagram, UI wireframe).

Provide a concise, highly insightful, and professional response. 
Do not explicitly mention "Based on the JSON" or "I see an array of objects"—speak naturally as if you are looking directly at their diagram.
`;

export async function POST(req: Request) {
    try {
        const { prompt, boardContext } = await req.json();
        
        // We use 2.5-flash for its massive context window, perfect for reading large JSONs
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // We combine the system instructions, the board data, and the user's question
        const fullPrompt = `
        ${SYSTEM_PROMPT}
        
        --- CURRENT BOARD STATE (JSON) ---
        ${JSON.stringify(boardContext)}
        
        --- USER QUESTION ---
        ${prompt}
        `;

        const result = await model.generateContent(fullPrompt);
        const responseText = result.response.text();
        
        return NextResponse.json({ reply: responseText });
    } catch (error: any) {
        console.error("AI Chat Error:", error.message || error);
        return NextResponse.json({ error: "Failed to analyze the board" }, { status: 500 });
    }
}