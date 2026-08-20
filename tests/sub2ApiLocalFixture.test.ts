import {createServer, type IncomingMessage, type ServerResponse} from 'node:http';
import type {AddressInfo} from 'node:net';
import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {listNewApiModelsForConfig, translateWithNewApiRuntime} from '@/entrypoints/service/newapi-core';

interface CapturedRequest {
  method?: string;
  path?: string;
  authorization?: string;
  body: string;
}

function readBody(request: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    request.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    request.on('error', reject);
  });
}

async function startSub2ApiFixture() {
  const captured: CapturedRequest[] = [];
  const server = createServer(async (request: IncomingMessage, response: ServerResponse) => {
    const body = await readBody(request);
    const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1');
    captured.push({
      method: request.method,
      path: requestUrl.pathname,
      authorization: request.headers.authorization,
      body,
    });

    if (request.method === 'GET' && requestUrl.pathname === '/v1/models') {
      response.writeHead(200, {'Content-Type': 'text/plain'});
      response.end(JSON.stringify({data: [{id: 'sub2api-fixture-model', owned_by: 'local-fixture'}]}));
      return;
    }

    if (request.method === 'POST' && requestUrl.pathname === '/v1/chat/completions') {
      response.writeHead(200, {'Content-Type': 'text/event-stream'});
      response.end(JSON.stringify({choices: [{message: {content: '本地夹具翻译'}}]}));
      return;
    }

    response.writeHead(404, {'Content-Type': 'application/json'});
    response.end(JSON.stringify({error: 'not found'}));
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const {port} = server.address() as AddressInfo;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    captured,
    close: () => new Promise<void>((resolve, reject) => {
      server.close(error => (error ? reject(error) : resolve()));
    }),
  };
}

describe('Sub2API local fixture integration', () => {
  let fixture: Awaited<ReturnType<typeof startSub2ApiFixture>> | undefined;

  beforeEach(async () => {
    fixture = await startSub2ApiFixture();
    vi.restoreAllMocks();
  });

  afterEach(async () => {
    await fixture?.close();
    fixture = undefined;
  });

  function runNewApi(message: {origin: string; pageContext?: string}) {
    return translateWithNewApiRuntime(message, {
      endpoint: fixture?.baseUrl ?? '',
      service: 'newapi',
      apiKeyForService: () => 'fixture-token',
      buildBody: request => JSON.stringify({
        model: 'sub2api-fixture-model',
        messages: [
          {role: 'system', content: 'You are a translator.'},
          {role: 'user', content: `Translate to zh-Hans: ${request.origin}`},
        ],
        stream: true,
        temperature: 0.1,
      }),
      postProcess: text => text.trim(),
    });
  }

  it('discovers models without sending translation text', async () => {
    await expect(listNewApiModelsForConfig(fixture?.baseUrl ?? '', 'fixture-token')).resolves.toEqual({
      status: 'available',
      models: [{id: 'sub2api-fixture-model', ownedBy: 'local-fixture'}],
    });

    expect(fixture?.captured).toHaveLength(1);
    expect(fixture?.captured[0]).toMatchObject({
      method: 'GET',
      path: '/v1/models',
      authorization: 'Bearer fixture-token',
      body: '',
    });
    expect(fixture?.captured[0].body).not.toContain('hello');
  });

  it('sends non-streaming Chat Completions and parses JSON with an incorrect Content-Type', async () => {
    await expect(runNewApi({origin: 'hello', pageContext: ''})).resolves.toBe('本地夹具翻译');

    expect(fixture?.captured).toHaveLength(1);
    const request = fixture?.captured[0];
    expect(request).toMatchObject({
      method: 'POST',
      path: '/v1/chat/completions',
      authorization: 'Bearer fixture-token',
    });

    const body = JSON.parse(request?.body ?? '{}');
    expect(body).toMatchObject({
      model: 'sub2api-fixture-model',
      stream: false,
      temperature: 0.1,
    });
    expect(JSON.stringify(body)).toContain('hello');
  });
});
