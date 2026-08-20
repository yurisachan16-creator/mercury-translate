import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {describe, expect, it} from 'vitest';

const workerShim = readFileSync(
    new URL('../public/fluent-read-ocr/worker/mercury-inline-language-worker.js', import.meta.url),
    'utf8',
);

describe('OCR inline language worker shim', () => {
    // Regression: ISSUE-006 — verified inline model bytes must initialize by language code.
    // Found by /qa on 2026-08-20
    // Report: .gstack/qa-reports/qa-report-mercury-translate-browser-2026-08-20.md
    it('preserves inline model bytes for loading and uses only codes for initialization', () => {
        const listeners: Array<(event: {data: Record<string, any>}) => void> = [];
        const imports: string[] = [];
        const self = {
            addEventListener: (_type: string, listener: (event: {data: Record<string, any>}) => void) => {
                listeners.push(listener);
            },
        };
        const importScripts = (path: string) => imports.push(path);
        runInNewContext(workerShim, {self, importScripts});

        const inlineLanguage = {code: 'chi_sim', data: new Uint8Array([1, 2, 3])};
        const loadLanguage = {action: 'loadLanguage', payload: {langs: [inlineLanguage]}};
        listeners[0]({data: loadLanguage});
        expect(loadLanguage.payload.langs).toEqual([inlineLanguage]);

        const initialize = {action: 'initialize', payload: {langs: [inlineLanguage, 'eng']}};
        listeners[0]({data: initialize});
        expect(initialize.payload.langs).toEqual(['chi_sim', 'eng']);
        expect(imports).toEqual(['./worker.min.js']);
    });
});
