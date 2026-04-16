import { Annotation, StateGraph, END } from "@langchain/langgraph";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatGroq } from "@langchain/groq";
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";

// ──────────────────────────────────────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────────────────────────────────────

export type ClientMessage = {
    role: string;
    content: string;
};

/**
 * Collected trip fields — explicitly tracked so graph routing is deterministic.
 */
export type CollectedFields = {
    origin?: string;
    destination?: string;
    groupSize?: string;
    budget?: string;
    duration?: string;
    interests?: string;
    specialRequirements?: string;
};

// ──────────────────────────────────────────────────────────────────────────────
// Graph State
// ──────────────────────────────────────────────────────────────────────────────

/**
 * TripGraphState holds everything the graph needs across node executions.
 * - messages: full conversation history as LangChain BaseMessage objects
 * - collected: parsed trip fields gathered so far
 * - response: the final object to return to the caller
 */
const TripGraphState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
        reducer: (x, y) => x.concat(y),
        default: () => [],
    }),
    collected: Annotation<CollectedFields>({
        reducer: (x, y) => ({ ...x, ...y }),
        default: () => ({}),
    }),
    response: Annotation<Record<string, any>>({
        reducer: (_x, y) => y,
        default: () => ({}),
    }),
});

// ──────────────────────────────────────────────────────────────────────────────
// Prompts
// ──────────────────────────────────────────────────────────────────────────────

const EXTRACT_SYSTEM = `You are a trip planning assistant data extractor. 
Given the conversation history, extract any trip planning information the user has mentioned.
Return ONLY a valid JSON object with exactly these keys (omit keys where information is not yet known):
{
  "origin": "string",
  "destination": "string",
  "groupSize": "Solo|Couple|Family|Friends",
  "budget": "Low|Medium|High",
  "duration": "number as string e.g. 5",
  "interests": "string",
  "specialRequirements": "string"
}
Do NOT include markdown, explanations, or any text outside the JSON.`;

const CONVERSE_SYSTEM = `You are Atlas, a friendly and enthusiastic AI Trip Planner. 
Your job is to collect trip planning details from the user ONE question at a time.
Required information in order:
1. origin (starting location)
2. destination (where they want to go)
3. groupSize (Solo, Couple, Family, or Friends)
4. budget (Low, Medium, or High)
5. duration (number of days)
6. interests (e.g., adventure, cultural, food, relaxation)
7. specialRequirements (optional — always ask last)

Rules:
- Ask for only the NEXT missing field
- Be warm and conversational, not robotic
- If the user's answer is unclear, politely ask to clarify

Return ONLY valid JSON in this format:
{
  "resp": "Your friendly question or response here",
  "ui": "budget" | "groupSize" | "TripDuration" | "interests" | ""
}

UI values to use:
- "budget" when asking about budget
- "groupSize" when asking about group size
- "TripDuration" when asking about trip duration
- "" for all other questions`;

const GENERATE_SYSTEM = `You are an expert AI Trip Planner. Using the collected trip information, generate a detailed, realistic trip itinerary.
Return ONLY a valid JSON object matching this exact schema (no markdown, no explanations):
{
  "trip_plan": {
    "destination": "string",
    "duration": "string",
    "origin": "string",
    "budget": "string",
    "group_size": "string",
    "hotels": [
      {
        "hotel_name": "string",
        "hotel_address": "string",
        "price_per_night": "string",
        "hotel_image_url": "string",
        "geo_coordinates": { "latitude": 0.0, "longitude": 0.0 },
        "rating": 4.5,
        "description": "string"
      }
    ],
    "itinerary": [
      {
        "day": 1,
        "day_plan": "string",
        "best_time_to_visit_day": "string",
        "activities": [
          {
            "place_name": "string",
            "place_details": "string",
            "place_image_url": "string",
            "geo_coordinates": { "latitude": 0.0, "longitude": 0.0 },
            "place_address": "string",
            "ticket_pricing": "string",
            "time_travel_each_location": "string",
            "best_time_to_visit": "string"
          }
        ]
      }
    ]
  }
}`;

// ──────────────────────────────────────────────────────────────────────────────
// Helper: extract JSON object from model output (handles leading prose + markdown)
// ──────────────────────────────────────────────────────────────────────────────

function extractJson(text: string): string {
    // 1. Strip markdown code fences if present
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch) return fenceMatch[1].trim();

    // 2. Find the first top-level JSON object in the text (for models that prefix with prose)
    const firstBrace = text.indexOf("{");
    if (firstBrace !== -1) {
        let depth = 0;
        for (let i = firstBrace; i < text.length; i++) {
            if (text[i] === "{") depth++;
            else if (text[i] === "}") { depth--; if (depth === 0) return text.slice(firstBrace, i + 1); }
        }
    }
    return text.trim();
}

// ──────────────────────────────────────────────────────────────────────────────
// Model instances + manual fallback invoker
// ──────────────────────────────────────────────────────────────────────────────

function getGemini(temperature: number) {
    return new ChatGoogleGenerativeAI({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        apiKey: process.env.GEMINI_API_KEY || "",
        temperature,
        maxRetries: 0,
    });
}

function getGroq(temperature: number, maxTokens?: number) {
    return new ChatGroq({
        model: "llama-3.3-70b-versatile",
        apiKey: process.env.GROQ_API_KEY || "",
        temperature,
        ...(maxTokens ? { maxTokens } : {}),
    });
}

/**
 * Tries Gemini first; if it throws for ANY reason (rate limit, quota, network),
 * immediately falls back to Groq. Manual try/catch is more reliable than
 * LangChain's .withFallbacks() which may not catch all Gemini error types.
 */
async function invokeWithFallback(
    messages: BaseMessage[],
    temperature: number,
    maxTokens?: number
): Promise<string> {
    const gemini = getGemini(temperature);
    let result;
    try {
        result = await gemini.invoke(messages);
        console.log("[LLM] Using Gemini");
    } catch (geminiErr: any) {
        const reason = geminiErr?.status ?? geminiErr?.message ?? "unknown";
        console.warn(`[LLM] Gemini failed (${reason}), switching to Groq...`);
        const groq = getGroq(temperature, maxTokens);
        result = await groq.invoke(messages);
        console.log("[LLM] Using Groq (fallback)");
    }
    return typeof result.content === "string"
        ? result.content
        : JSON.stringify(result.content);
}

// ──────────────────────────────────────────────────────────────────────────────
// Required fields list
// ──────────────────────────────────────────────────────────────────────────────

const REQUIRED_FIELDS: (keyof CollectedFields)[] = [
    "origin",
    "destination",
    "groupSize",
    "budget",
    "duration",
    "interests",
];

function hasMissingFields(collected: CollectedFields): boolean {
    return REQUIRED_FIELDS.some((f) => !collected[f]);
}

// ──────────────────────────────────────────────────────────────────────────────
// Node 1: extractInfo
//   Parse the latest user message and update CollectedFields in the state.
// ──────────────────────────────────────────────────────────────────────────────

async function extractInfo(
    state: typeof TripGraphState.State
): Promise<Partial<typeof TripGraphState.State>> {
    const msgs = [
        new SystemMessage(EXTRACT_SYSTEM),
        ...state.messages,
    ];

    try {
        const text = await invokeWithFallback(msgs, 0);
        const parsed = JSON.parse(extractJson(text)) as CollectedFields;
        return { collected: parsed };
    } catch {
        return {}; // Extraction failure is non-fatal; graph will proceed to converse
    }
}

// ──────────────────────────────────────────────────────────────────────────────
// Node 2: converse
//   Ask the next relevant question based on what is still missing.
// ──────────────────────────────────────────────────────────────────────────────

async function converse(
    state: typeof TripGraphState.State
): Promise<Partial<typeof TripGraphState.State>> {
    const missingFields = REQUIRED_FIELDS.filter((f) => !state.collected[f]);
    const contextNote = `Already collected: ${JSON.stringify(state.collected)}. Missing: ${missingFields.join(", ")}.`;

    const msgs = [
        new SystemMessage(CONVERSE_SYSTEM + "\n\n" + contextNote),
        ...state.messages,
    ];

    const text = await invokeWithFallback(msgs, 0.7);

    let parsed: { resp: string; ui: string };
    try {
        parsed = JSON.parse(extractJson(text));
    } catch {
        // Strip any JSON remnants and show only the human-readable part
        parsed = { resp: text.replace(/\{[\s\S]*?\}/g, "").trim() || text, ui: "" };
    }

    return {
        response: { resp: parsed.resp, ui: parsed.ui || "" },
        messages: [new AIMessage(parsed.resp)],
    };
}

// ──────────────────────────────────────────────────────────────────────────────
// Node 3: generateTrip
//   All required fields are available — generate the full structured trip plan.
// ──────────────────────────────────────────────────────────────────────────────

async function generateTrip(
    state: typeof TripGraphState.State
): Promise<Partial<typeof TripGraphState.State>> {
    const { collected } = state;

    const tripContext = `
Trip details provided by the user:
- Origin: ${collected.origin}
- Destination: ${collected.destination}
- Group size: ${collected.groupSize}
- Budget: ${collected.budget}
- Duration: ${collected.duration} days
- Interests: ${collected.interests}
- Special requirements: ${collected.specialRequirements || "None"}

Generate a comprehensive, realistic trip plan with at least 3 hotel options and a COMPLETE full day-by-day itinerary. Include real place names and accurate geo-coordinates. Make sure the JSON is fully complete — do not stop early or truncate.`;

    const msgs = [
        new SystemMessage(GENERATE_SYSTEM),
        new HumanMessage(tripContext),
    ];

    // Use maxTokens=32768 for Groq so the large JSON is never truncated
    const text = await invokeWithFallback(msgs, 1.0, 32768);
    const cleaned = extractJson(text);

    let tripPlan: Record<string, any>;
    try {
        tripPlan = JSON.parse(cleaned);
    } catch {
        throw new Error(`generateTrip: Invalid JSON from model: ${text.slice(0, 300)}`);
    }

    return { response: tripPlan };
}

// ──────────────────────────────────────────────────────────────────────────────
// Conditional routing
// ──────────────────────────────────────────────────────────────────────────────

function routeAfterExtraction(state: typeof TripGraphState.State): "converse" | "generateTrip" {
    return hasMissingFields(state.collected) ? "converse" : "generateTrip";
}

// ──────────────────────────────────────────────────────────────────────────────
// Compile Graph
// ──────────────────────────────────────────────────────────────────────────────

const workflow = new StateGraph(TripGraphState)
    .addNode("extractInfo", extractInfo)
    .addNode("converse", converse)
    .addNode("generateTrip", generateTrip)
    .addEdge("__start__", "extractInfo")
    .addConditionalEdges("extractInfo", routeAfterExtraction, {
        converse: "converse",
        generateTrip: "generateTrip",
    })
    .addEdge("converse", END)
    .addEdge("generateTrip", END);

const tripPlannerGraph = workflow.compile();

// ──────────────────────────────────────────────────────────────────────────────
// AIService — public API (same interface as before for compatibility)
// ──────────────────────────────────────────────────────────────────────────────

/**
 * AIService wraps the LangGraph trip planner.
 * The `chat` method accepts the full conversation history and returns either:
 *  - { resp, ui } for conversational turns
 *  - { trip_plan: {...} } once all fields are collected
 */
export class AIService {
    static async chat(messages: ClientMessage[]): Promise<Record<string, any>> {
        if (!messages || messages.length === 0) {
            throw new Error("No messages provided.");
        }

        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role !== "user") {
            throw new Error("Last message must be from user.");
        }

        // Convert ClientMessage[] → LangChain BaseMessage[]
        const langchainMessages: BaseMessage[] = messages.map((m) =>
            m.role === "user" ? new HumanMessage(m.content) : new AIMessage(m.content)
        );

        const finalState = await tripPlannerGraph.invoke({
            messages: langchainMessages,
            collected: {},
        });

        return finalState.response;
    }
}
