const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testModel(modelName) {
    console.log(`\nTesting model: ${modelName}`);
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log(`✅ Success! Response: ${response.text().substring(0, 50)}...`);
        return true;
    } catch (error) {
        console.error(`❌ Failed: ${error.message}`);
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Details: ${JSON.stringify(error.response, null, 2)}`);
        }
        return false;
    }
}

async function main() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("No API Key found in .env");
        return;
    }
    console.log("Starting Model Verification...");

    // Test the one we want first
    await testModel("gemini-2.0-flash");

    // Test the stable fallback
    await testModel("gemini-1.5-flash");

    // Test the older one
    await testModel("gemini-pro");
}

main();
