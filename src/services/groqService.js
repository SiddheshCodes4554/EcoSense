import Groq from "groq-sdk";

const API_KEY = import.meta.env.VITE_GROQ_API_KEY;

const groq = new Groq({
    apiKey: API_KEY,
    dangerouslyAllowBrowser: true
});

export const fetchCarbonAnalysis = async (data) => {
    if (!API_KEY) {
        console.warn('Groq API Key missing');
        // Return mock data if no key
        return {
            verdict: "Configuration Pending",
            swaps: ["Add API Key to .env", "Restart Server"]
        };
    }

    try {
        const prompt = `
        You are an Environmental Auditor.
        User Data: Transport (${data.transport}), Diet (${data.diet}), Energy (${data.energy}). Total Emissions: ${data.total} tons.
        Identify the single biggest problem area.
        Suggest 2 specific, hard-hitting swaps.
        Return ONLY valid JSON: { "verdict": "string", "swaps": ["string", "string"] }.
        `;

        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            response_format: { type: "json_object" }
        });

        const result = JSON.parse(completion.choices[0]?.message?.content || "{}");
        return result;
        return result;
    } catch (error) {
        console.error("Groq Analysis Error:", error);
        return {
            verdict: "Analysis Failed: " + (error.message || "Unknown error"),
            swaps: ["Check API Key", "See Console for details"]
        };
    }
};
