import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage } from "@langchain/core/messages";
import dotenv from "dotenv";
dotenv.config();

const primaryLlm = new ChatGoogleGenerativeAI({
    model: "gemini-2.5-flash",
    apiKey: "BAD_KEY",
    maxRetries: 0
});

const fallbackLlm = new ChatGroq({
    model: "llama-3.3-70b-versatile",
    apiKey: process.env.GROQ_API_KEY,
    maxRetries: 0
});

const llm = primaryLlm.withFallbacks({ fallbacks: [fallbackLlm] });

async function run() {
    try {
        console.log("Invoking...");
        const result = await llm.invoke([new HumanMessage("This is a test message. Respond with exactly the word TEST.")]);
        console.log("Success:", result.content);
    } catch (e) {
        console.error("Error:", e);
    }
}
run();
