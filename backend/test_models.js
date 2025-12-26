const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function listModels() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // For listing models, we don't need a specific model instance usually, 
    // but the SDK structure is a bit different. 
    // Actually the SDK doesn't have a direct 'listModels' on the class in 0.24.1?
    // Let's check the docs or try a simple generateContent with a known safe model like 'gemini-1.0-pro-latest' or just try to debug.

    // There isn't a simple listModels exposed directly in the simplified SDK sometimes, 
    // but we can try to hit the API directly or just test a few names.

    startTest('gemini-1.5-flash');
    startTest('gemini-1.5-pro');
    startTest('gemini-1.0-pro');
    startTest('gemini-pro');
}

async function startTest(modelName) {
    console.log(`Testing model: ${modelName}`);
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you there?");
        const response = await result.response;
        console.log(`✅ SUCCESS: ${modelName} responded: ${response.text()}`);
    } catch (error) {
        console.log(`❌ FAILED: ${modelName} - ${error.message}`);
    }
}

listModels();
