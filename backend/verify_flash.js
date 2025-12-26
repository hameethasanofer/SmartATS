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
        return false;
    }
}

async function main() {
    await testModel("gemini-1.5-flash");
}

main();
