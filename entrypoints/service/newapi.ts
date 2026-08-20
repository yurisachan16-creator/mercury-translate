import {commonMsgTemplate} from "../utils/template";
import { config } from "@/entrypoints/utils/config";
import { contentPostHandler } from "@/entrypoints/utils/check";
import { listNewApiModelsForConfig, translateWithNewApiRuntime } from './newapi-core';
import type { OpenAiCompatibleModelCatalog } from './openai-compatible';

export async function listConfiguredNewApiModels(): Promise<OpenAiCompatibleModelCatalog> {
    return listNewApiModelsForConfig(config.newApiUrl, config.token.newapi);
}

async function newapi(message: any) {
    try {
        return await translateWithNewApiRuntime(message, {
            endpoint: config.newApiUrl,
            service: config.service,
            apiKeyForService: (service) => config.token[service],
            buildBody: (request, service) => commonMsgTemplate(
                request.origin,
                request.pageContext,
                request.summaryPrompt,
                request.summarySystemPrompt,
                service,
            ),
            postProcess: contentPostHandler,
        });
    } catch (error) {
        console.error('API调用失败');
        throw error;
    }
}

export default newapi;
