import { beforeEach, describe, expect, it, vi } from 'vitest';

const loadVerifiedOcrLanguageAssetsMock = vi.fn();
const createWorkerMock = vi.fn();

vi.mock('@/entrypoints/utils/ocrLanguageAssets', () => ({
    clearVerifiedOcrLanguageAssets: vi.fn(),
    loadVerifiedOcrLanguageAssets: loadVerifiedOcrLanguageAssetsMock,
}));

vi.mock('tesseract.js', () => ({
    PSM: { SPARSE_TEXT: 11 },
    createWorker: createWorkerMock,
}));

describe('offscreen OCR language downloads', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        loadVerifiedOcrLanguageAssetsMock.mockResolvedValue([]);
    });

    // Regression: ISSUE-003 — language downloads must not start the OCR worker.
    // Found by /qa on 2026-08-20
    // Report: .gstack/qa-reports/qa-report-mercury-translate-browser-2026-08-20.md
    it('downloads and verifies language assets without creating an OCR worker', async () => {
        const { downloadImageOcrLanguages } = await import('@/entrypoints/offscreen/imageOcr');

        await downloadImageOcrLanguages(['chi_sim', 'eng']);

        expect(loadVerifiedOcrLanguageAssetsMock).toHaveBeenCalledWith(['chi_sim', 'eng']);
        expect(createWorkerMock).not.toHaveBeenCalled();
    });

    it('skips empty language download requests', async () => {
        const { downloadImageOcrLanguages } = await import('@/entrypoints/offscreen/imageOcr');

        await downloadImageOcrLanguages([]);

        expect(loadVerifiedOcrLanguageAssetsMock).not.toHaveBeenCalled();
        expect(createWorkerMock).not.toHaveBeenCalled();
    });
});
