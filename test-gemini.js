const fs = require('fs');
const https = require('https');
require('dotenv').config({ path: '.env.local' });
const { GoogleGenerativeAI } = require('@google/generative-ai');

function log(msg) {
    console.log(msg);
    fs.appendFileSync('test-output.txt', msg + '\n');
}

async function testGemini() {
    fs.writeFileSync('test-output.txt', 'Starting Multi-Model Test...\n');
    log("Testing Gemini API Integration...");

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        log("ERROR: No API Key found");
        return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const modelsToTest = ["gemini-1.5-flash-8b", "gemini-2.0-flash-exp", "gemini-1.5-flash", "gemini-1.5-pro"];

    for (const modelName of modelsToTest) {
        log(`\n--- Testing Model: ${modelName} ---`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = "Reply with just the word 'Connected'.";
            const result = await model.generateContent(prompt);
            const response = await result.response;
            log(`SUCCESS! ${modelName} replied: "${response.text()}"`);
            log(`!!! WE FOUND A WORKING MODEL: ${modelName} !!!`);
            return; // Stop after finding the first working one
        } catch (error) {
            log(`FAILED (${modelName}): ${error.message}`);
            if (error.message.includes("429")) log("Reason: Rate Limit Exceeded");
            if (error.message.includes("404")) log("Reason: Model Not Found");
        }
    }
    log("\nALL MODELS FAILED.");
}

testGemini();
