const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function main() {
    try {
        console.log("Testing Groq API...");
        const completion = await groq.chat.completions.create({
            messages: [{ role: 'user', content: 'Say hello in JSON format: {"message": "hello"}' }],
            model: 'llama-3.3-70b-versatile',
        });
        console.log("Success!");
        console.log(completion.choices[0].message.content);
    } catch (e) {
        console.error("Groq Failure:", e);
    }
}

main();
