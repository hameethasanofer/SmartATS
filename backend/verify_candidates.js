const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// SAME LIST AS IN SERVER.JS
const CANDIDATE_MODELS = [
    "gemini-flash-latest",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash-exp",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-pro"
];

async function verifyCandidates() {
    console.log("Verifying Candidate Models...");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    for (const modelName of CANDIDATE_MODELS) {
        try {
            console.log(`\nAttempting: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            const response = await result.response;
            console.log(`✅ SUCCESS with ${modelName}`);
            console.log(`   Response: ${response.text().trim()}`);
            return; // Exit after first success, just like server
        } catch (e) {
            console.log(`❌ Failed: ${modelName} - ${e.message.substring(0, 100)}...`);
        }
    }
    console.log("\n❌ ALL MODELS FAILED.");
}

verifyCandidates();
