import {describe, expect, it, vi} from 'vitest';

import {
  OPENAI_COMPATIBLE_ERROR_CODES,
  listOpenAiCompatibleModels,
  normalizeOpenAiCompatibleEndpoints,
  readOpenAiCompatibleJson,
} from '@/entrypoints/service/openai-compatible';

describe('OpenAI-compatible endpoint normalization', () => {
  it.each([
    ['https://gateway.example', 'https://gateway.example/v1/chat/completions', 'https://gateway.example/v1/models'],
    ['https://gateway.example/prefix', 'https://gateway.example/prefix/v1/chat/completions', 'https://gateway.example/prefix/v1/models'],
    ['https://gateway.example/prefix/v1/', 'https://gateway.example/prefix/v1/chat/completions', 'https://gateway.example/prefix/v1/models'],
    ['https://gateway.example/prefix/v1/chat/completions', 'https://gateway.example/prefix/v1/chat/completions', 'https://gateway.example/prefix/v1/models'],
  ])('normalizes %s', (endpoint, chatCompletionsUrl, modelsUrl) => {
    expect(normalizeOpenAiCompatibleEndpoints(endpoint)).toEqual({chatCompletionsUrl, modelsUrl});
  });

  it('rejects Responses API endpoints for this non-streaming release', () => {
    expect(() => normalizeOpenAiCompatibleEndpoints('https://gateway.example/prefix/v1/responses'))
      .toThrow(expect.objectContaining({code: OPENAI_COMPATIBLE_ERROR_CODES.responsesUnsupported}));
  });
});

describe('OpenAI-compatible model discovery', () => {
  it('uses an explicit text-free GET /v1/models and returns stable IDs', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      data: [{id: 'z-model'}, {id: 'a-model', owned_by: 'Sub2API'}, {id: ''}],
    }), {status: 200, headers: {'Content-Type': 'text/event-stream'}}));

    await expect(listOpenAiCompatibleModels('https://gateway.example/proxy/v1', 'not-a-real-key', fetchImpl))
      .resolves.toEqual({
        status: 'available',
        models: [{id: 'a-model', ownedBy: 'Sub2API'}, {id: 'z-model'}],
      });
    expect(fetchImpl).toHaveBeenCalledWith('https://gateway.example/proxy/v1/models', expect.objectContaining({
      method: 'GET',
      headers: expect.any(Headers),
    }));
    const headers = fetchImpl.mock.calls[0][1].headers as Headers;
    expect(headers.get('Authorization')).toBe('Bearer not-a-real-key');
  });

  it('signals manual entry when a gateway does not implement /v1/models', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('', {status: 404}));
    await expect(listOpenAiCompatibleModels('https://gateway.example', undefined, fetchImpl))
      .resolves.toEqual({status: 'manual', reason: 'models-unsupported'});
  });

  it.each([
    [401, OPENAI_COMPATIBLE_ERROR_CODES.authenticationFailed],
    [403, OPENAI_COMPATIBLE_ERROR_CODES.authenticationFailed],
    [429, OPENAI_COMPATIBLE_ERROR_CODES.rateLimited],
    [500, OPENAI_COMPATIBLE_ERROR_CODES.upstreamFailure],
  ])('maps HTTP %i to a typed error', async (status, code) => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('', {status}));
    await expect(listOpenAiCompatibleModels('https://gateway.example', undefined, fetchImpl))
      .rejects.toThrow(expect.objectContaining({code}));
  });

  it('accepts JSON even when a gateway labels it as SSE, but rejects an actual SSE stream', async () => {
    await expect(readOpenAiCompatibleJson(new Response('{"data":[]}', {
      headers: {'Content-Type': 'text/event-stream'},
    }))).resolves.toEqual({data: []});

    await expect(readOpenAiCompatibleJson(new Response('data: {"data":[]}\n\n', {
      headers: {'Content-Type': 'text/event-stream'},
    }))).rejects.toThrow(expect.objectContaining({
      code: OPENAI_COMPATIBLE_ERROR_CODES.sseUnsupported,
    }));
  });
});
