# Privacy Policy

Updated: 2026-08-20

Mercury Translate has no account system, backend, telemetry, ads, subscription, or payment feature. The extension processes webpage, subtitle, image, and PDF text according to the provider you choose.

Local translation means Chrome Translator API or your own Ollama endpoint. Google, Microsoft/Bing, DeepSeek, Gemini, OpenAI/GPT, OpenAI-compatible endpoints, and experimental DeepLX are network services. If local translation is unavailable, Mercury asks before sending text to a network service.

API keys are stored only in `chrome.storage.local`. They are excluded from settings export by default. A transfer file can include secrets only after an explicit plaintext warning.

PDF bytes remain in memory. The optional cache stores translated text and hashes for reuse, not the original PDF. OCR language models are downloaded on demand from fixed release assets, verified with SHA-256, and cached locally.

Mercury Translate does not sell data or send analytics to a Mercury backend. Chosen network providers process submitted text under their own terms.
