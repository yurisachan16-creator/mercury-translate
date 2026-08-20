import { createWorker, PSM, type Worker } from 'tesseract.js';
import { getOcrLanguages, normalizeOcrLines, type OcrLine } from '@/entrypoints/utils/imageTranslationCore';
import type { ImageOcrLanguageCode } from '@/entrypoints/utils/imageOcrLanguages';
import {
    clearVerifiedOcrLanguageAssets,
    loadVerifiedOcrLanguageAssets,
} from '@/entrypoints/utils/ocrLanguageAssets';

let workerPromise: Promise<Worker> | null = null;
let workerLanguages = '';

function extensionAsset(path: string): string {
    const getRuntimeUrl = chrome.runtime.getURL as (assetPath: string) => string;
    return getRuntimeUrl(`/fluent-read-ocr/${path}`);
}

async function getOcrWorkerForLanguages(languageCodes: string): Promise<Worker> {
    const languages = languageCodes;
    if (workerPromise && workerLanguages === languages) return workerPromise;

    if (workerPromise) {
        const previousWorker = await workerPromise.catch(() => null);
        await previousWorker?.terminate().catch(() => undefined);
    }

    workerLanguages = languages;
    workerPromise = (async () => {
        const verifiedLanguages = await loadVerifiedOcrLanguageAssets(
            languages.split('+') as ImageOcrLanguageCode[],
        );
        return createWorker(verifiedLanguages, 1, {
        // Tesseract v6's bundled worker accepts verified inline language bytes
        // during `loadLanguage`, but serializes those bytes as the language name
        // during `initialize`. Route through our tiny local shim so only that
        // initialize message is converted back to the stable language codes.
        workerPath: extensionAsset('worker/mercury-inline-language-worker.js'),
        corePath: extensionAsset('core'),
        cachePath: 'mercury-image-ocr',
        cacheMethod: 'none',
        gzip: false,
        // Worker and WASM code are packaged with the extension. Language data
        // is fetched by Mercury, verified, and supplied as bytes so Tesseract
        // never silently contacts its default CDN.
        workerBlobURL: false,
        });
    })().catch(error => {
        workerPromise = null;
        workerLanguages = '';
        throw error;
    });

    return workerPromise;
}

async function getOcrWorker(sourceLanguage: string): Promise<Worker> {
    return getOcrWorkerForLanguages(getOcrLanguages(sourceLanguage).join('+'));
}

export async function recognizeImage(image: string, sourceLanguage: string): Promise<OcrLine[]> {
    const worker = await getOcrWorker(sourceLanguage);
    // 图片文字通常是分散在画面各处的气泡/标签，不是连续的网页段落。
    // Sparse text 能减少 Tesseract 把相邻控件合并成一个超大行框的情况。
    await worker.setParameters({
        tessedit_pageseg_mode: PSM.SPARSE_TEXT,
        preserve_interword_spaces: '1',
    });
    const result = await worker.recognize(image, {}, { blocks: true });
    return normalizeOcrLines(result.data.blocks);
}

export async function downloadImageOcrLanguages(languages: ImageOcrLanguageCode[]): Promise<void> {
    if (languages.length === 0) return;
    await loadVerifiedOcrLanguageAssets(languages);
}

export async function clearImageOcrLanguages(): Promise<void> {
    const activeWorker = workerPromise;
    workerPromise = null;
    workerLanguages = '';
    const worker = await activeWorker?.catch(() => null);
    await worker?.terminate().catch(() => undefined);
    await clearVerifiedOcrLanguageAssets();
}
