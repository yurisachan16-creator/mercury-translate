import {beforeEach, describe, expect, it, vi} from 'vitest';
import {listNewApiModelsForConfig, translateWithNewApiRuntime} from '@/entrypoints/service/newapi-core';
import {OPENAI_COMPATIBLE_ERROR_CODES} from '@/entrypoints/service/openai-compatible';

describe('newapi OpenAI-compatible adapter', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  function runNewApi(message: {origin: string; pageContext?: string}) {
    return translateWithNewApiRuntime(message, {
      endpoint: 'https://gateway.example/prefix',
      service: 'newapi',
      apiKeyForService: () => 'not-a-real-key',
      buildBody: request => JSON.stringify({
        model: 'sub2api-model',
        messages: [
          {role: 'system', content: 'You are a translator.'},
          {role: 'user', content: `Translate to zh-Hans: ${request.origin}`},
        ],
        stream: true,
        temperature: 0.2,
      }),
      postProcess: text => text.trim(),
    });
  }

  it('uses the normalized Chat Completions endpoint and forces stream:false after custom fields', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      choices: [{message: {content: '翻译结果'}}],
    }), {status: 200, headers: {'Content-Type': 'text/event-stream'}}));

    await expect(runNewApi({origin: 'hello', pageContext: ''})).resolves.toBe('翻译结果');
    expect(fetchMock).toHaveBeenCalledWith('https://gateway.example/prefix/v1/chat/completions', expect.objectContaining({
      method: 'POST',
      headers: expect.any(Headers),
    }));
    const request = fetchMock.mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(request.body))).toMatchObject({
      model: 'sub2api-model',
      temperature: 0.2,
      stream: false,
    });
    expect((request.headers as Headers).get('Authorization')).toBe('Bearer not-a-real-key');
  });

  it('rejects real SSE responses instead of attempting a second protocol', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('data: {"choices":[]}\n\n', {
      status: 200,
      headers: {'Content-Type': 'text/event-stream'},
    }));
    await expect(runNewApi({origin: 'hello', pageContext: ''})).rejects.toThrow(expect.objectContaining({
      code: OPENAI_COMPATIBLE_ERROR_CODES.sseUnsupported,
    }));
  });

  it('uses saved New API configuration for explicit model discovery', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      data: [{id: 'sub2api-model'}],
    }), {status: 200}));

    await expect(listNewApiModelsForConfig('https://gateway.example/prefix', 'not-a-real-key')).resolves.toEqual({
      status: 'available',
      models: [{id: 'sub2api-model'}],
    });
    expect(fetchMock).toHaveBeenCalledWith('https://gateway.example/prefix/v1/models', expect.objectContaining({method: 'GET'}));
  });
});
