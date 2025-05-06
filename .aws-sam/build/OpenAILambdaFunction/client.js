"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const openai_1 = __importDefault(require("openai"));
async function makeRequest(useStreaming = false) {
    var _a, _b;
    try {
        // Initialize OpenAI client with custom baseURL
        const openai = new openai_1.default({
            baseURL: 'https://yyg6foe61d.execute-api.us-east-1.amazonaws.com/Prod/',
            apiKey: 'dummy-key', // Required by the client but not used with local server
            timeout: 25000, // 25 second timeout
            maxRetries: 2
        });
        console.log('Making request...');
        if (useStreaming) {
            // Make a completion request with streaming enabled
            const stream = await openai.chat.completions.create({
                messages: [{ role: "user", content: "Tell me a short story about a cat!" }],
                model: "gpt-3.5-turbo",
                stream: true,
            });
            // Process the stream
            console.log("Streaming response:");
            for await (const chunk of stream) {
                const content = ((_b = (_a = chunk.choices[0]) === null || _a === void 0 ? void 0 : _a.delta) === null || _b === void 0 ? void 0 : _b.content) || '';
                process.stdout.write(content); // Force flush
            }
            console.log('\n'); // Add a newline at the end
        }
        else {
            // Make a regular completion request
            const completion = await openai.chat.completions.create({
                messages: [{ role: "user", content: "Tell me a short story about a cat!" }],
                model: "gpt-3.5-turbo",
            });
            console.log("completion:", completion);
            console.log("completion text:", completion.choices[0].message.content);
        }
    }
    catch (error) {
        console.error('Error making request:', error);
        if (error instanceof Error) {
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
        }
    }
}
// Run a single test request without streaming first
console.log('Starting test request...');
makeRequest(false)
    .then(() => {
    console.log('Test request completed');
    process.exit(0);
})
    .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
// Uncomment to run with streaming
