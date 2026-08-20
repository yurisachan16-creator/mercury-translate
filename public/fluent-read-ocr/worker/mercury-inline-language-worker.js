/*
 * Tesseract.js 6 loads inline `{code, data}` language objects correctly, but
 * its bundled worker later passes `data` (the complete Uint8Array) to
 * TessBaseAPI.Init as the language string. Keep the verified bytes intact for
 * `loadLanguage`, then turn only the following `initialize` request into the
 * language codes Tesseract expects. This file and worker.min.js are packaged
 * extension assets; no code or language model is fetched by this shim.
 */
self.addEventListener('message', (event) => {
    const message = event.data;
    const languages = message?.action === 'initialize'
        ? message.payload?.langs
        : undefined;
    if (!Array.isArray(languages)) return;

    message.payload.langs = languages.map((language) => (
        typeof language === 'string' ? language : language?.code
    ));
});

importScripts('./worker.min.js');
