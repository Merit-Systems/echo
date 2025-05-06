"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseSSE = parseSSE;
exports.handleBody = handleBody;
function parseSSE(data) {
    // Split by double newlines to separate events
    const events = data.split('\n\n');
    const chunks = [];
    for (const event of events) {
        if (!event.trim())
            continue;
        // Each event should start with 'data: '
        if (event.startsWith('data: ')) {
            const jsonStr = event.slice(6); // Remove 'data: ' prefix
            // Skip [DONE] marker
            if (jsonStr.trim() === '[DONE]')
                continue;
            try {
                const parsed = JSON.parse(jsonStr);
                chunks.push(parsed);
            }
            catch (error) {
                console.error('Error parsing SSE chunk:', error);
            }
        }
    }
    return chunks;
}
function handleBody(data, stream) {
    try {
        if (stream) {
            const chunks = parseSSE(data);
            // Process each chunk
            for (const chunk of chunks) {
                // Only log usage if it exists
                if (chunk.usage) {
                    console.log('Streaming chunk usage:', {
                        prompt_tokens: chunk.usage.prompt_tokens,
                        completion_tokens: chunk.usage.completion_tokens,
                        total_tokens: chunk.usage.total_tokens
                    });
                }
            }
        }
        else {
            // Handle complete response
            const parsed = JSON.parse(data);
            if (parsed.usage) {
                console.log('Complete response usage:', {
                    prompt_tokens: parsed.usage.prompt_tokens,
                    completion_tokens: parsed.usage.completion_tokens,
                    total_tokens: parsed.usage.total_tokens
                });
            }
        }
    }
    catch (error) {
        console.error('Error processing data:', error);
    }
}
