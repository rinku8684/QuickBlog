import { GoogleGenAI } from "@google/genai";

const KEY = process.argv[2] || process.env.GEMINI_API_KEY || "";
const MODELS = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-lite-preview-02-05",
    "gemini-2.5-flash",
    "gemini-2.5-flash-preview-05-20",
    "gemini-1.5-flash",
    "gemini-1.5-flash-002",
    "gemini-1.5-flash-001",
    "gemini-1.5-flash-8b",
    "gemini-1.5-flash-8b-001",
];

if (!KEY) { console.error("No key"); process.exit(1); }
console.log("Key prefix:", KEY.slice(0, 8), "... len=", KEY.length);

const ai = new GoogleGenAI({ apiKey: KEY, apiVersion: "v1" });
for (const model of MODELS) {
    console.log(`\n-- ${model} --`);
    try {
        const t0 = Date.now();
        const res = await ai.models.generateContent({
            model,
            contents: [{ role: "user", parts: [{ text: "say: OK" }] }],
        });
        const ms = Date.now() - t0;
        let text = "";
        try { text = typeof res.text === "function" ? res.text() : (res.text || ""); } catch(_){}
        if (!text && res.candidates?.[0]?.content?.parts?.[0]?.text) {
            text = res.candidates[0].content.parts[0].text;
        }
        console.log(`OK (${ms}ms) ->`, text.replace(/\s+/g," ").slice(0,200));
        process.exit(0);
    } catch (err) {
        const msg = (err && err.message) ? String(err.message) : String(err);
        let code = null, full = null;
        if (msg.trim().startsWith("{")) {
            try { full = JSON.parse(msg); code = full?.error?.code; } catch(_){}
        }
        const header = (full?.error?.details && Array.isArray(full.error.details))
            ? full.error.details.map(d => d.reason || d.metadata || '').join('|').slice(0,120)
            : '';
        console.log(`FAIL code=${code} len=${msg.length} headers/reason=${header}`);
        console.log(`  => ${msg.slice(0,260)}`);
    }
}
console.log("\nNo model succeeded");
