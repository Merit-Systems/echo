"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const compression_1 = __importDefault(require("compression"));
const helpers_1 = require("./helpers");
const serverless_http_1 = __importDefault(require("serverless-http"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = 3000;
// OpenAI API base URL
const BASE_URL = 'https://api.openai.com/v1';
// Add middleware
app.use(express_1.default.json());
app.use((0, compression_1.default)());
// Function to process headers
async function processHeaders(headers) {
    /**
     * Remove problematic headers
     * host,
     * authorization,
     * content-encoding,
     * content-length,
     * transfer-encoding
     *
     *
     *
     * Does a processing step on the headers, in the future this will be an authentication step
     * which will be used to properly set the Openai API key
     */
    const { host, authorization, 'content-encoding': contentEncoding, 'content-length': contentLength, 'transfer-encoding': transferEncoding, connection, ...restHeaders } = headers;
    // Peform Auth Handshake.
    // Are they a merit user? How many tokens do they have left?
    // If they are not a merit user, we need to return a 401 Unauthorized status code
    // Ensure content-type is set correctly
    return {
        ...restHeaders,
        'content-type': 'application/json',
        'accept-encoding': 'gzip, deflate',
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    };
}
// Function to duplicate a stream
function duplicateStream(stream) {
    /**
     * Duplicate a stream
     *
     * This is a helper function to duplicate a stream
     */
    return stream.tee();
}
// Main route handler
app.all('*', async (req, res) => {
    var _a;
    try {
        // Process headers
        const processedHeaders = await processHeaders(req.headers);
        if (req.body.stream) {
            req.body.stream_options = {
                include_usage: true
            };
        }
        // Forward the request to OpenAI API
        const openAIUrl = `${BASE_URL}${req.path}`;
        console.log('Making request to OpenAI:', openAIUrl);
        const response = await fetch(openAIUrl, {
            method: req.method,
            headers: processedHeaders,
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
        });
        console.log("new outbound request", `${BASE_URL}${req.path}`, req.method);
        // Check if this is a streaming response
        const isStreaming = (_a = response.headers.get('content-type')) === null || _a === void 0 ? void 0 : _a.includes('text/event-stream');
        if (isStreaming) {
            // Handle streaming response
            const bodyStream = response.body;
            if (!bodyStream) {
                throw new Error('No body stream returned from OpenAI API');
            }
            const [stream1, stream2] = duplicateStream(bodyStream);
            // Pipe the main stream directly to the response
            const reader1 = stream1.getReader();
            const reader2 = stream2.getReader();
            (async () => {
                try {
                    while (true) {
                        const { done, value } = await reader1.read();
                        if (done)
                            break;
                        res.write(value);
                    }
                    res.end();
                }
                catch (error) {
                    console.error('Error reading stream:', error);
                }
            })();
            let data = '';
            (async () => {
                try {
                    while (true) {
                        const { done, value } = await reader2.read();
                        if (done)
                            break;
                        data += new TextDecoder().decode(value);
                    }
                    console.log('Stream data:', data);
                    (0, helpers_1.handleBody)(data, true);
                }
                catch (error) {
                    console.error('Error processing stream:', error);
                }
            })();
        }
        else {
            // Handle non-streaming response
            const data = await response.json();
            (0, helpers_1.handleBody)(JSON.stringify(data), false);
            res.setHeader('content-type', 'application/json'); // Set the content type to json
            res.json(data);
        }
    }
    catch (error) {
        console.error('Error handling request:', error);
        res.status(500).send('Internal Server Error');
    }
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
async function handleRequest(req, context) {
    // Set the path from the Lambda event
    if (context.path) {
        // Remove the base path if it exists
        req.path = context.path.replace('/Prod', '');
    }
    else if (context.pathParameters && context.pathParameters.proxy) {
        req.path = `/${context.pathParameters.proxy}`;
    }
    req.method = context.httpMethod;
    req.headers = context.headers;
    // Parse the body if it exists and is a string
    if (context.body) {
        try {
            req.body = typeof context.body === 'string' ? JSON.parse(context.body) : context.body;
        }
        catch (error) {
            console.error('Error parsing request body:', error);
            req.body = context.body;
        }
    }
    return req;
}
// Configure serverless handler
exports.handler = (0, serverless_http_1.default)(app, {
    provider: 'aws',
    basePath: '/Prod',
    request: (req, event, context) => {
        return handleRequest(req, context);
    },
    response: async (res) => {
        return res;
    }
});
/**
 * Main Lambda handler that routes between streaming and non-streaming responses
 */
module.exports.funcName = async (context, event) => {
    console.log('Lambda handler called');
    try {
        // Otherwise use regular handler
        return (0, exports.handler)(event, context);
    }
    catch (error) {
        console.error('Lambda execution error:', error);
        throw error;
    }
};
