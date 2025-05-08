import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import compression from 'compression';
import { handleBody } from './helpers';
import { ReadableStream } from 'stream/web';
import ServerlessHttp from 'serverless-http';


dotenv.config();

const app = express();
const port = 3000;

// OpenAI API base URL
const BASE_URL = 'https://api.openai.com/v1';

// Add middleware
app.use(express.json());

// Function to process headers
async function processHeaders(headers: Record<string, string>): Promise<Record<string, string>> {
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
    const { 
        host,
        Authorization,
        authorization,
        ...restHeaders 
    } = headers;
    
    // Always use the OpenAI API key
    return {
        ...restHeaders,
        'content-type': 'application/json',
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    };
}

// Function to duplicate a stream
function duplicateStream(stream: ReadableStream<Uint8Array>): [ReadableStream<Uint8Array>, ReadableStream<Uint8Array>] {
    /**
     * Duplicate a stream
     * 
     * This is a helper function to duplicate a stream
     */
    return stream.tee();
}

// Main route handler
app.all('*', async (req: Request, res: Response) => {
    try {
        // Process headers
        const processedHeaders = await processHeaders(req.headers as Record<string, string>);

        console.log("processed headers", processedHeaders);

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
        const isStreaming = response.headers.get('content-type')?.includes('text/event-stream');
        
        if (isStreaming) {
            // Handle streaming response
            const bodyStream = response.body as ReadableStream<Uint8Array>;
            if (!bodyStream) {
                throw new Error('No body stream returned from OpenAI API');
            }
            const [stream1, stream2] = duplicateStream(bodyStream);

            // Pipe the main stream directly to the response
            const reader1 = stream1.getReader();
            const reader2 = stream2.getReader();

            (async () => { // Pipe the main stream directly to the response
                try {
                    while (true) {
                        const { done, value } = await reader1.read();
                        if (done) break;
                        console.log("streaming value", value);
                        res.write(value);
                    }
                    res.end();
                } catch (error) {
                    console.error('Error reading stream:', error);
                }
            })();

            let data = '';
            (async () => { // Process the duped stream separately
                try {
                    while (true) {
                        const { done, value } = await reader2.read();
                        if (done) break;
                        data += new TextDecoder().decode(value);
                    }
                    console.log('Stream data:', data);
                    handleBody(data, true);
                } catch (error) {
                    console.error('Error processing stream:', error);
                }
            })();
        } else {
            // Handle non-streaming response
            const data = await response.json();
            console.log("non-streamed response data", data);
            handleBody(JSON.stringify(data), false);
            res.setHeader('content-type', 'application/json'); // Set the content type to json
            res.json(data);
        }

    } catch (error) {
        console.error('Error handling request:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 


async function handleRequest(req: any, event: any, context: any) {
    // Set the path from the Lambda event
    if (context.rawPath) {
        req.path = context.rawPath;
    }
    
    // Set the HTTP method
    req.method = context.requestContext.http.method;
    
    // Set headers, but remove content-length
    const { 'content-length': _, ...headers } = context.headers || {};
    req.headers = headers;
    
    // Parse the body if it exists
    if (context.body) {
        try {
            // If body is a string, parse it as JSON
            req.body = typeof context.body === 'string' ? JSON.parse(context.body) : context.body;
        } catch (error) {
            console.error('Error parsing request body:', error);
            throw new Error('Invalid JSON body');
        }
    }

    // Add query string parameters if they exist
    if (context.rawQueryString) {
        req.query = new URLSearchParams(context.rawQueryString);
    }

    console.log("processed request", req);

    console.log("processed request simple", {
        path: req.path,
        method: req.method,
        headers: req.headers,
        body: req.body
    });
    
    return req;
}


// Configure serverless handler
export const handler = ServerlessHttp(app, {
    provider: 'aws',
    basePath: '/Prod',
    request: async (req: any, event: any, context: any) => {
        console.log("initial request", req);
        const processedReq = await handleRequest(req, event, context);
        console.log("processed request", processedReq);
        return processedReq;
    },
    response: async (res: any) => {
        // Remove compression headers for Lambda responses
        if (res._headers) {
            delete res._headers['content-encoding'];
            delete res._headers['content-length'];
            delete res._headers['transfer-encoding'];
        }
        if (res[Symbol.for('kOutHeaders')]) {
            delete res[Symbol.for('kOutHeaders')]['content-encoding'];
            delete res[Symbol.for('kOutHeaders')]['content-length'];
            delete res[Symbol.for('kOutHeaders')]['transfer-encoding'];
        }
        // Remove compression from the header string
        if (res._header) {
            res._header = res._header.replace(/Content-Encoding: gzip\r\n/g, '');
        }

        // Parse the body as JSON if it's a string and content-type is application/json
        if (typeof res.body === 'string' && 
            res._headers && 
            res._headers['content-type']?.includes('application/json')) {
            try {
                res.body = JSON.parse(res.body);
            } catch (error) {
                console.error('Error parsing response body as JSON:', error);
            }
        }

        const assembledResponse = {
            statusCode: res.statusCode,
            body: res.body,
            headers: res._headers
        }

        console.log("assembled response", assembledResponse);

        return assembledResponse;
    }
});

/**
 * Main Lambda handler that routes between streaming and non-streaming responses
 */
module.exports.funcName = async (context: any, event: any) => {
    console.log('Lambda handler called');

    console.log("event", event);
    console.log("context", context);

    try {       
        // Otherwise use regular handler
        return handler(event, context);
    } catch (error) {
        console.error('Lambda execution error:', error);
        throw error;
    }
};