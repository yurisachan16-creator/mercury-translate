import {commonMsgTemplate} from "../utils/template";
import { config } from "@/entrypoints/utils/config";
import { contentPostHandler } from "@/entrypoints/utils/check";
import {
    createOpenAiCompatibleHeaders,
    forceNonStreamingChatBody,
    listOpenAiCompatibleModels,
    normalizeOpenAiCompatibleEndpoints,
    readOpenAiCompatibleJson,
    type OpenAiCompatibleModelCatalog,
} from './openai-compatible';

export async function listConfiguredNewApiModels(): Promise<OpenAiCompatibleModelCatalog> {
    return listOpenAiCompatibleModels(config.newApiUrl, config.token.newapi);
}

async function newapi(message: any) {
    try {
        const service = message.serviceOverride || config.service;
        const {chatCompletionsUrl} = normalizeOpenAiCompatibleEndpoints(config.newApiUrl);
        const headers = createOpenAiCompatibleHeaders(config.token[service]);
        // Custom fields are merged by the shared template, then this adapter
        // is the final authority for non-streaming Chat Completions.
        const body = forceNonStreamingChatBody(commonMsgTemplate(
            message.origin,
            message.pageContext,
            message.summaryPrompt,
            message.summarySystemPrompt,
            service,
        ));

        const resp = await fetch(chatCompletionsUrl, {
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
            return contentPostHandler(content);
        }

        throw new Error('翻译失败: 上游未返回内容');
    } catch (error) {
        console.error('API调用失败');
        throw error;
    }
}

export default newapi;
