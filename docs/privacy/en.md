# Privacy Policy

Updated: 2026-08-20

Mercury Translate has no account system, backend, telemetry, ads, subscription, or payment feature. The extension processes webpage, subtitle, image, and PDF text according to the provider you choose.

Local translation means Chrome Translator API or your own Ollama endpoint. Google, Microsoft/Bing, DeepSeek, Gemini, OpenAI/GPT, OpenAI-compatible / Sub2API endpoints, and experimental DeepLX are network services. If local translation is unavailable, Mercury asks before sending text to a network service.

For OpenAI-compatible / Sub2API endpoints, model discovery is requested only when you click the model-fetch action. That request goes to `/v1/models` and does not include webpage, subtitle, image, or PDF text. Translation text is sent only after you start translation, through non-streaming `/v1/chat/completions`.

API keys are stored only in `chrome.storage.local`. They are excluded from settings export by default. A transfer file can include secrets only after an explicit plaintext warning.

PDF bytes remain in memory. The optional cache stores translated text and hashes for reuse, not the original PDF. OCR language models are downloaded on demand from fixed release assets, verified with SHA-256, and cached locally. Current pinned sizes are `eng` 4,113,088 bytes, `chi_sim` 2,469,156 bytes, `chi_tra` 2,366,642 bytes, `jpn` 2,471,260 bytes, and `kor` 1,677,415 bytes.

Mercury Translate does not sell data or send analytics to a Mercury backend. Chosen network providers process submitted text under their own terms.
