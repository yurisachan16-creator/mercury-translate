import Dexie, { type Table } from 'dexie';
import type { ImageOcrLanguageCode } from './imageOcrLanguages';

export type OcrLanguageAssetDescriptor = {
    code: ImageOcrLanguageCode;
    bytes: number;
    sha256: string;
};

type StoredOcrLanguageAsset = OcrLanguageAssetDescriptor & {
    data: ArrayBuffer;
    verifiedAt: number;
};

const TESSDATA_FAST_COMMIT = '87416418657359cb625c412a48b6e1d6d41c29bd';
const FALLBACK_ASSET_BASE_URL = `https://raw.githubusercontent.com/tesseract-ocr/tessdata_fast/${TESSDATA_FAST_COMMIT}`;
const configuredBaseUrl = process.env.MERCURY_OCR_BASE_URL?.trim();

export const OCR_LANGUAGE_ASSET_BASE_URL = (configuredBaseUrl || FALLBACK_ASSET_BASE_URL).replace(/\/$/, '');

export const OCR_LANGUAGE_ASSETS: Record<ImageOcrLanguageCode, OcrLanguageAssetDescriptor> = {
    eng: {
        code: 'eng',
        bytes: 4_113_088,
        sha256: '7d4322bd2a7749724879683fc3912cb542f19906c83bcc1a52132556427170b2',
    },
    chi_sim: {
        code: 'chi_sim',
        bytes: 2_469_156,
        sha256: 'a5fcb6f0db1e1d6d8522f39db4e848f05984669172e584e8d76b6b3141e1f730',
    },
    chi_tra: {
        code: 'chi_tra',
        bytes: 2_366_642,
        sha256: '529c5b5797d64b126065cd55f2bb4c7fd7b15790798091b1ff259941a829330b',
    },
    jpn: {
        code: 'jpn',
        bytes: 2_471_260,
        sha256: '1f5de9236d2e85f5fdf4b3c500f2d4926f8d9449f28f5394472d9e8d83b91b4d',
    },
    kor: {
        code: 'kor',
        bytes: 1_677_415,
        sha256: '6b85e11d9bbf07863b97b3523b1b112844c43e713df8b66418a081fd1060b3b2',
    },
};

class MercuryOcrAssetDatabase extends Dexie {
    assets!: Table<StoredOcrLanguageAsset, ImageOcrLanguageCode>;

    constructor() {
        super('mercury-ocr-assets');
        this.version(1).stores({ assets: '&code,verifiedAt' });
    }
}

let database: MercuryOcrAssetDatabase | undefined;
const inFlightAssetLoads = new Map<ImageOcrLanguageCode, Promise<ArrayBuffer>>();
let assetGeneration = 0;

function getDatabase(): MercuryOcrAssetDatabase {
    database ??= new MercuryOcrAssetDatabase();
    return database;
}

export async function sha256Hex(data: ArrayBuffer): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', data);
    return [...new Uint8Array(digest)]
        .map(value => value.toString(16).padStart(2, '0'))
        .join('');
}

export async function verifyOcrLanguageAsset(
    descriptor: OcrLanguageAssetDescriptor,
    data: ArrayBuffer,
): Promise<void> {
    if (data.byteLength !== descriptor.bytes) {
        throw new Error(`${descriptor.code} OCR language model size mismatch`);
    }
    const digest = await sha256Hex(data);
    if (digest !== descriptor.sha256) {
        throw new Error(`${descriptor.code} OCR language model checksum mismatch`);
    }
}

async function readVerifiedCachedAsset(descriptor: OcrLanguageAssetDescriptor): Promise<ArrayBuffer | null> {
    const stored = await getDatabase().assets.get(descriptor.code);
    if (!stored || stored.sha256 !== descriptor.sha256 || stored.bytes !== descriptor.bytes) return null;
    try {
        await verifyOcrLanguageAsset(descriptor, stored.data);
        return stored.data;
    } catch {
        await getDatabase().assets.delete(descriptor.code);
        return null;
    }
}

async function fetchAndCacheVerifiedOcrLanguageAsset(code: ImageOcrLanguageCode): Promise<ArrayBuffer> {
    const generation = assetGeneration;
    const descriptor = OCR_LANGUAGE_ASSETS[code];
    const cached = await readVerifiedCachedAsset(descriptor);
    if (cached) return cached;

    const response = await fetch(`${OCR_LANGUAGE_ASSET_BASE_URL}/${code}.traineddata`, {
        credentials: 'omit',
        redirect: 'follow',
        cache: 'no-store',
    });
    if (!response.ok) {
        throw new Error(`Unable to download ${code} OCR language model (${response.status})`);
    }

    const data = await response.arrayBuffer();
    await verifyOcrLanguageAsset(descriptor, data);
    if (generation !== assetGeneration) {
        throw new Error(`${code} OCR language model download was cleared before completion`);
    }
    await getDatabase().assets.put({ ...descriptor, data, verifiedAt: Date.now() });
    return data;
}

/** Coalesces concurrent first-use requests so each language model downloads once. */
export function loadVerifiedOcrLanguageAsset(code: ImageOcrLanguageCode): Promise<ArrayBuffer> {
    const active = inFlightAssetLoads.get(code);
    if (active) return active;

    const request = fetchAndCacheVerifiedOcrLanguageAsset(code);
    inFlightAssetLoads.set(code, request);
    void request.then(
        () => {
            if (inFlightAssetLoads.get(code) === request) inFlightAssetLoads.delete(code);
        },
        () => {
            if (inFlightAssetLoads.get(code) === request) inFlightAssetLoads.delete(code);
        },
    );
    return request;
}

export async function loadVerifiedOcrLanguageAssets(codes: ImageOcrLanguageCode[]) {
    const uniqueCodes = [...new Set(codes)];
    return Promise.all(uniqueCodes.map(async code => ({
        code,
        data: new Uint8Array(await loadVerifiedOcrLanguageAsset(code)),
    })));
}

export async function clearVerifiedOcrLanguageAssets(): Promise<void> {
    assetGeneration += 1;
    await getDatabase().assets.clear();
}
