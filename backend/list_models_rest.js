const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Accessing the model list is not directly exposed in the high-level SDK easily purely via method sometimes,
        // but we can try to use a dummy model to list if possible, or use the REST API approach for certainty.
        // Actually, the best way for the USER to debug this is to see exactly what 'listModels' returns if we could call it.
        // But since the SDK wraps it, let's use the REST API approach which is more transparent for debugging.

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.log("No API Key");
            return;
        }

        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const Response = await fetch(url);
        const data = await Response.json();

        if (data.models) {
            console.log("\n✅ Available Models for this Key:");
            data.models.forEach(m => {
                if (m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')) {
                    console.log(`- ${m.name}`);
                }
            });
        } else {
            console.log("❌ No models found or error:", JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error("Error listing models:", error);
    }
}

listModels();
