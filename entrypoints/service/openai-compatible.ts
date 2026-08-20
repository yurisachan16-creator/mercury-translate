import { appendOptionalBearer } from './auth';

export const OPENAI_COMPATIBLE_ERROR_CODES = {
  invalidEndpoint: 'openai-compatible-invalid-endpoint',
  responsesUnsupported: 'openai-compatible-responses-unsupported',
  modelsUnsupported: 'openai-compatible-models-unsupported',
  authenticationFailed: 'openai-compatible-authentication-failed',
  rateLimited: 'openai-compatible-rate-limited',
  upstreamFailure: 'openai-compatible-upstream-failure',
  invalidResponse: 'openai-compatible-invalid-response',
  sseUnsupported: 'openai-compatible-sse-unsupported',
} as const;

export type OpenAiCompatibleErrorCode = typeof OPENAI_COMPATIBLE_ERROR_CODES[keyof typeof OPENAI_COMPATIBLE_ERROR_CODES];

export class OpenAiCompatibleError extends Error {
  constructor(
    public readonly code: OpenAiCompatibleErrorCode,
    public readonly details: Record<string, unknown> = {},
  ) {
    super(code);
    this.name = 'OpenAiCompatibleError';
  }
}

export function isOpenAiCompatibleError(error: unknown): error is OpenAiCompatibleError {
  return error instanceof OpenAiCompatibleError;
}

export interface OpenAiCompatibleEndpoints {
  chatCompletionsUrl: string;
  modelsUrl: string;
}

export interface OpenAiCompatibleModel {
  id: string;
  ownedBy?: string;
}

export type OpenAiCompatibleModelCatalog =
  | { status: 'available'; models: OpenAiCompatibleModel[] }
  | { status: 'manual'; reason: 'models-unsupported' };

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

function normalizePath(pathname: string): string {
  return pathname.replace(/\/+$/, '') || '/';
}

function endpointError(code: OpenAiCompatibleErrorCode, details?: Record<string, unknown>): OpenAiCompatibleError {
  return new OpenAiCompatibleError(code, details);
}

/**
 * Converts a gateway root, an API root, or an exact Chat Completions URL into
 * the two non-streaming OpenAI-compatible endpoints used by Mercury.
 */
export function normalizeOpenAiCompatibleEndpoints(endpoint: string): OpenAiCompatibleEndpoints {
  const value = endpoint.trim();
  if (!value) throw endpointError(OPENAI_COMPATIBLE_ERROR_CODES.invalidEndpoint);

  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw endpointError(OPENAI_COMPATIBLE_ERROR_CODES.invalidEndpoint);
  }

  if (!['http:', 'https:'].includes(parsed.protocol)
    || parsed.username
    || parsed.password
    || parsed.search
    || parsed.hash) {
    throw endpointError(OPENAI_COMPATIBLE_ERROR_CODES.invalidEndpoint);
  }

  const path = normalizePath(parsed.pathname);
  const lowerPath = path.toLowerCase();
  if (lowerPath.endsWith('/v1/responses')) {
    throw endpointError(OPENAI_COMPATIBLE_ERROR_CODES.responsesUnsupported);
  }

  let apiRootPath: string;
  if (lowerPath.endsWith('/v1/chat/completions')) {
    apiRootPath = path.slice(0, -'/chat/completions'.length);
  } else if (lowerPath.endsWith('/v1')) {
    apiRootPath = path;
  } else {
    apiRootPath = `${path === '/' ? '' : path}/v1`;
  }

  const makeUrl = (suffix: string): string => {
    const target = new URL(parsed.toString());
    target.pathname = `${apiRootPath}${suffix}`;
    target.search = '';
    target.hash = '';
    return target.toString();
  };

  return {
    chatCompletionsUrl: makeUrl('/chat/completions'),
    modelsUrl: makeUrl('/models'),
  };
}

function isActualSseBody(body: string): boolean {
  return /^(?:event|data|id|retry):/m.test(body.trim());
}

/**
 * Several OpenAI-compatible gateways incorrectly label ordinary JSON as SSE.
 * Parse the body itself so that valid JSON remains compatible, while actual
 * event streams fail deterministically because v0.1.2 is non-streaming only.
 */
export async function readOpenAiCompatibleJson(response: Pick<Response, 'text'>): Promise<unknown> {
  const body = await response.text();
  if (!body.trim()) {
    throw endpointError(OPENAI_COMPATIBLE_ERROR_CODES.invalidResponse);
  }
  if (isActualSseBody(body)) {
    throw endpointError(OPENAI_COMPATIBLE_ERROR_CODES.sseUnsupported);
  }
  try {
    return JSON.parse(body);
  } catch {
    throw endpointError(OPENAI_COMPATIBLE_ERROR_CODES.invalidResponse);
  }
}

export function forceNonStreamingChatBody(body: string): string {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    throw endpointError(OPENAI_COMPATIBLE_ERROR_CODES.invalidResponse);
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw endpointError(OPENAI_COMPATIBLE_ERROR_CODES.invalidResponse);
  }
  return JSON.stringify({...(parsed as Record<string, unknown>), stream: false});
}

export function createOpenAiCompatibleHeaders(apiKey?: string): Headers {
  const headers = new Headers({'Content-Type': 'application/json'});
  appendOptionalBearer(headers, apiKey);
  return headers;
}

function createHttpError(response: Pick<Response, 'status'>): OpenAiCompatibleError {
  if (response.status === 401 || response.status === 403) {
    return endpointError(OPENAI_COMPATIBLE_ERROR_CODES.authenticationFailed, {status: response.status});
  }
  if (response.status === 429) {
    return endpointError(OPENAI_COMPATIBLE_ERROR_CODES.rateLimited, {status: response.status});
  }
  return endpointError(OPENAI_COMPATIBLE_ERROR_CODES.upstreamFailure, {status: response.status});
}

function normalizeModel(item: unknown): OpenAiCompatibleModel | null {
  if (!item || typeof item !== 'object') return null;
  const record = item as Record<string, unknown>;
  if (typeof record.id !== 'string' || !record.id.trim()) return null;
  return {
    id: record.id.trim(),
    ...(typeof record.owned_by === 'string' && record.owned_by.trim()
      ? {ownedBy: record.owned_by.trim()}
      : {}),
  };
}

/** Explicit, text-free model discovery for OpenAI-compatible/Sub2API gateways. */
export async function listOpenAiCompatibleModels(
  endpoint: string,
  apiKey?: string,
  fetchImpl: FetchLike = fetch,
): Promise<OpenAiCompatibleModelCatalog> {
  const {modelsUrl} = normalizeOpenAiCompatibleEndpoints(endpoint);
  const response = await fetchImpl(modelsUrl, {
    method: 'GET',
    headers: createOpenAiCompatibleHeaders(apiKey),
  });

  if (response.status === 404) {
    return {status: 'manual', reason: 'models-unsupported'};
  }
  if (!response.ok) throw createHttpError(response);

  const result = await readOpenAiCompatibleJson(response);
  const data = result && typeof result === 'object'
    ? (result as {data?: unknown}).data
    : undefined;
  if (!Array.isArray(data)) {
    throw endpointError(OPENAI_COMPATIBLE_ERROR_CODES.invalidResponse);
  }

  const models = data
    .map(normalizeModel)
    .filter((model): model is OpenAiCompatibleModel => model !== null)
    .sort((left, right) => left.id.localeCompare(right.id));
  return {status: 'available', models};
}
