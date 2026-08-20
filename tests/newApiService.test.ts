import {beforeEach, describe, expect, it, vi} from 'vitest';

const {mockConfig} = vi.hoisted(() => ({
  mockConfig: {
    service: 'newapi',
    newApiUrl: 'https://gateway.example/prefix',
    token: {newapi: 'not-a-real-key'} as Record<string, string>,
    model: {newapi: 'sub2api-model'} as Record<string, string>,
    customModel: {} as Record<string, string>,
    system_role: {newapi: 'You are a translator.'} as Record<string, string>,
    user_role: {newapi: 'Translate to {{to}}: {{origin}}'} as Record<string, string>,
    customBody: {newapi: '{"stream":true,"temperature":0.2}'} as Record<string, string>,
    robot_id: {} as Record<string, string>,
    to: 'zh-Hans',
  },
}));

vi.mock('@/entrypoints/utils/config', () => ({config: mockConfig}));

import newapi, {listConfiguredNewApiModels} from '@/entrypoints/service/newapi';
import {OPENAI_COMPATIBLE_ERROR_CODES} from '@/entrypoints/service/openai-compatible';

describe('newapi OpenAI-compatible adapter', () => {
  beforeEach(() => {
    mockConfig.service = 'newapi';
    mockConfig.newApiUrl = 'https://gateway.example/prefix';
    mockConfig.token = {newapi: 'not-a-real-key'};
    mockConfig.model = {newapi: 'sub2api-model'};
    mockConfig.customModel = {};
    mockConfig.system_role = {newapi: 'You are a translator.'};
    mockConfig.user_role = {newapi: 'Translate to {{to}}: {{origin}}'};
    mockConfig.customBody = {newapi: '{"stream":true,"temperature":0.2}'};
    mockConfig.to = 'zh-Hans';
    vi.restoreAllMocks();
  });

  it('uses the normalized Chat Completions endpoint and forces stream:false after custom fields', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      choices: [{message: {content: '翻译结果'}}],
    }), {status: 200, headers: {'Content-Type': 'text/event-stream'}}));

    await expect(newapi({origin: 'hello', pageContext: ''})).resolves.toBe('翻译结果');
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
    await expect(newapi({origin: 'hello', pageContext: ''})).rejects.toThrow(expect.objectContaining({
      code: OPENAI_COMPATIBLE_ERROR_CODES.sseUnsupported,
    }));
  });

  it('uses saved New API configuration for explicit model discovery', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({
      data: [{id: 'sub2api-model'}],
    }), {status: 200}));

    await expect(listConfiguredNewApiModels()).resolves.toEqual({
      status: 'available',
      models: [{id: 'sub2api-model'}],
    });
    expect(fetchMock).toHaveBeenCalledWith('https://gateway.example/prefix/v1/models', expect.objectContaining({method: 'GET'}));
  });
});
