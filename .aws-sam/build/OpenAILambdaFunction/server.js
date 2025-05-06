"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const compression_1 = __importDefault(require("compression"));
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
    try {
        console.log('Received request:', {
            path: req.path,
            method: req.method,
            headers: req.headers,
            body: req.body
        });
        // Process headers
        const processedHeaders = await processHeaders(req.headers);
        console.log('Processed headers:', processedHeaders);
        // Forward the request to OpenAI API
        const openAIUrl = `${BASE_URL}${req.path}`;
        console.log('Making request to OpenAI:', openAIUrl);
        const response = await fetch(openAIUrl, {
            method: req.method,
            headers: processedHeaders,
            body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined
        });
        console.log('OpenAI response status:', response.status);
        console.log('OpenAI response headers:', Object.fromEntries(response.headers.entries()));
        if (!response.ok) {
            const errorText = await response.text();
            console.error('OpenAI API error:', {
                status: response.status,
                statusText: response.statusText,
                body: errorText
            });
            return res.status(response.status).json({
                error: 'OpenAI API error',
                details: errorText
            });
        }
        // Handle non-streaming response
        const data = await response.json();
        console.log('Received response from OpenAI', data);
        // Set appropriate headers
        res.setHeader('content-type', 'application/json');
        // Send response
        return res.json(data);
    }
    catch (error) {
        console.error('Error handling request:', error);
        if (error instanceof Error) {
            console.error('Error details:', {
                name: error.name,
                message: error.message,
                stack: error.stack
            });
        }
        return res.status(500).json({
            error: 'Internal Server Error',
            message: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
// Configure serverless handler
exports.handler = (0, serverless_http_1.default)(app, {
    provider: 'aws',
    basePath: '/Prod',
    request: (req, event, context) => {
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
        console.log('Lambda event:', JSON.stringify(event, null, 2));
        console.log('Lambda context:', JSON.stringify(context, null, 2));
        console.log('Lambda request:', JSON.stringify(req, null, 2));
        return req;
    },
    response: (res) => {
        // Safely log response data without circular references
        return res;
    }
});
module.exports.funcName = async (context, event) => {
    try {
        const result = await (0, exports.handler)(event, context);
        // Safely log result without circular references
        return result;
    }
    catch (error) {
        console.error('Lambda execution error:', error);
        throw error;
    }
};
