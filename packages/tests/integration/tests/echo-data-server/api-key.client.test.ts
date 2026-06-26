import { TEST_CONFIG } from '@/config/test-config';
import { describe, test, expect } from 'vitest';
import { TEST_CLIENT_IDS, TEST_USER_API_KEYS } from '@/config/test-data';
import { echoControlApi } from '@/utils/api-client';
import { waitForBalanceUpdate } from '@/utils/balance-helpers';
import OpenAI from 'openai';

describe('API Key Client', () => {
  test('should be able to make a streaming LLM request with API key', async () => {
    const apiKey = TEST_USER_API_KEYS.primary;
    const balanceCheck = await echoControlApi.getBalance(apiKey);
    expect(balanceCheck.totalPaid).toBeGreaterThan(0);

    const openaiClient = new OpenAI({
      baseURL: TEST_CONFIG.services.echoDataServer,
      apiKey: apiKey,
    });

    const stream = await openaiClient.chat.completions.create({
      messages: [
        { role: 'user', content: 'Tell me a short story about a cat!' },
      ],
      model: 'gpt-3.5-turbo',
      stream: true,
    });

    expect(stream).toBeDefined();

    let receivedContent = '';
    let chunkCount = 0;

    for await (const chunk of stream) {
      chunkCount++;
      expect(chunk).toBeDefined();
      expect(chunk.choices).toBeDefined();
      const content = chunk.choices[0]?.delta?.content || '';
      receivedContent += content;
    }

    expect(chunkCount).toBeGreaterThan(0);
    expect(receivedContent.length).toBeGreaterThan(0);

    const secondBalanceCheck = await waitForBalanceUpdate(
      () => echoControlApi.getBalance(apiKey),
      balanceCheck
    );
    console.log('🔄 Second balance check: ', secondBalanceCheck);

    expect(secondBalanceCheck.totalPaid).toBe(balanceCheck.totalPaid);
    expect(secondBalanceCheck.totalSpent).toBeGreaterThanOrEqual(
      balanceCheck.totalSpent
    );
    expect(secondBalanceCheck.balance).toBeLessThan(balanceCheck.balance);

    console.log(
      '✅ Paid user (primary user) successfully made streaming LLM request and balance is updated'
    );
  });

  test('should be able to make a non-streaming LLM request with API key', async () => {
    const apiKey = TEST_USER_API_KEYS.primary;
    const balanceCheck = await echoControlApi.getBalance(apiKey);
    expect(balanceCheck.totalPaid).toBeGreaterThan(0);

    const openaiClient = new OpenAI({
      baseURL: TEST_CONFIG.services.echoDataServer,
      apiKey: apiKey,
    });

    const completion = await openaiClient.chat.completions.create({
      messages: [{ role: 'user', content: 'reply with a single word: hello' }],
      model: 'gpt-3.5-turbo',
      stream: false,
      max_completion_tokens: 16,
    });

    expect(completion).toBeDefined();
    expect(completion.choices).toBeDefined();
    expect(completion.choices[0]?.message?.content).toBeDefined();

    const secondBalanceCheck = await waitForBalanceUpdate(
      () => echoControlApi.getBalance(apiKey),
      balanceCheck
    );
    expect(secondBalanceCheck.totalPaid).toBe(balanceCheck.totalPaid);
    expect(secondBalanceCheck.totalSpent).toBeGreaterThanOrEqual(
      balanceCheck.totalSpent
    );
    expect(secondBalanceCheck.balance).toBeLessThan(balanceCheck.balance);

    console.log(
      '✅ Paid user (primary user) successfully made non-streaming LLM request and balance is updated'
    );
  });

  test('Should reject requests with an invalid API key', async () => {
    const apiKey = 'invalid-api-key';

    const openaiClient = new OpenAI({
      baseURL: TEST_CONFIG.services.echoDataServer,
      apiKey: apiKey,
    });

    const completion = await openaiClient.chat.completions
      .create({
        messages: [
          { role: 'user', content: 'Tell me a short story about a cat!' },
        ],
        model: 'gpt-3.5-turbo',
        stream: false,
      })
      .catch(error => {
        expect(error.status).toBe(401);
      });

    expect(completion).toBeUndefined();

    console.log('✅ Invalid API key successfully rejected');
  });

  test.skip('should be able to make a streaming LLM request with API key and app ID', async () => {
    const apiKey = TEST_USER_API_KEYS.primary;
    const balanceCheck = await echoControlApi.getBalance(apiKey);
    expect(balanceCheck.totalPaid).toBeGreaterThan(0);

    const openaiClient = new OpenAI({
      baseURL: `${TEST_CONFIG.services.echoDataServer}/${TEST_CLIENT_IDS.primary}`,
      apiKey: apiKey,
    });

    const stream = await openaiClient.chat.completions.create({
      messages: [
        { role: 'user', content: 'Tell me a short story about a cat!' },
      ],
      model: 'gpt-3.5-turbo',
      stream: true,
    });

    expect(stream).toBeDefined();

    let receivedContent = '';
    let chunkCount = 0;

    for await (const chunk of stream) {
      chunkCount++;
      expect(chunk).toBeDefined();
      expect(chunk.choices).toBeDefined();
      const content = chunk.choices[0]?.delta?.content || '';
      receivedContent += content;
    }

    expect(chunkCount).toBeGreaterThan(0);
    expect(receivedContent.length).toBeGreaterThan(0);
    console.log(
      '✅ Paid user (primary user) successfully made streaming LLM request with app ID'
    );
  });
});
