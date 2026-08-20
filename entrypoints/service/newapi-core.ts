import {
    createOpenAiCompatibleHeaders,
    forceNonStreamingChatBody,
    listOpenAiCompatibleModels,
    normalizeOpenAiCompatibleEndpoints,
    readOpenAiCompatibleJson,
    type OpenAiCompatibleModelCatalog,
} from './openai-compatible';

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

export interface NewApiMessage {
    origin: string;
    pageContext?: string;
    summaryPrompt?: string;
    summarySystemPrompt?: string;
    serviceOverride?: string;
}

export interface NewApiRuntime {
    endpoint: string;
    service: string;
    apiKeyForService: (service: string) => string | undefined;
    buildBody: (message: NewApiMessage, service: string) => string;
    postProcess: (content: string) => string;
    fetchImpl?: FetchLike;
}

export async function listNewApiModelsForConfig(
    endpoint: string,
    apiKey?: string,
    fetchImpl?: FetchLike,
): Promise<OpenAiCompatibleModelCatalog> {
    return listOpenAiCompatibleModels(endpoint, apiKey, fetchImpl);
}

export async function translateWithNewApiRuntime(message: NewApiMessage, runtime: NewApiRuntime): Promise<string> {
    const service = message.serviceOverride || runtime.service;
    const {chatCompletionsUrl} = normalizeOpenAiCompatibleEndpoints(runtime.endpoint);
    const headers = createOpenAiCompatibleHeaders(runtime.apiKeyForService(service));
    // Custom fields are merged by the caller's template, then this core is the
    // final authority for non-streaming Chat Completions.
    const body = forceNonStreamingChatBody(runtime.buildBody(message, service));
    const fetchImpl = runtime.fetchImpl ?? fetch;

    const resp = await fetchImpl(chatCompletionsUrl, {
        method: 'POST',
        headers,
        body,
    });

    if (!resp.ok) {
        throw new Error(`翻译失败: ${resp.status} ${resp.statusText}`);
    }

    const result = await readOpenAiCompatibleJson(resp) as {choices?: Array<{message?: {content?: unknown}}>};
    const content = result?.choices?.[0]?.message?.content;

    if (typeof content === 'string') {
        return runtime.postProcess(content);
    }

    throw new Error('翻译失败: 上游未返回内容');
}
