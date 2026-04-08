import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `
You are an AI assistant for Pulse, a collaborative whiteboard. 
Your task is to generate Excalidraw elements in JSON format based on user prompts.
Return ONLY a valid JSON array of ExcalidrawElementSkeleton objects.

Supported types: "rectangle", "diamond", "ellipse", "arrow", "text".
Every element needs: "type", "x", "y", "width", "height".
Text elements need a "text" field.
Shapes can have a "label" object with a "text" field.

Example output:
[
    { "type": "rectangle", "x": 100, "y": 100, "width": 200, "height": 100, "label": { "text": "Login" } },
    { "type": "arrow", "x": 300, "y": 150, "width": 100, "height": 0 }
]
`;

export async function POST(req: Request) {
    try {
        const { prompt } = await req.json();
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent([SYSTEM_PROMPT, prompt]);
        const responseText = result.response.text();
        
        console.log("=== RAW GEMINI OUTPUT ===");
        console.log(responseText);
        console.log("=========================");

        const startIndex = responseText.indexOf('[');
        const endIndex = responseText.lastIndexOf(']');

        if (startIndex === -1 || endIndex === -1) {
            return NextResponse.json({ error: "Gemini did not return an array." }, { status: 500 });
        }

        const cleanJson = responseText.substring(startIndex, endIndex + 1);
        
        const parsedData = JSON.parse(cleanJson);
        return NextResponse.json(parsedData);

    } catch (error: any) {
        console.error("Backend Crash:", error.message || error);
        
        return NextResponse.json(
            { error: error.message || "Unknown backend failure" }, 
            { status: 500 }
        );
    }
}