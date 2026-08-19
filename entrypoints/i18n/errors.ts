import { createTranslator, detectUiLocale, type MessagePath, type UiLocale } from './runtime';

export const OCR_MODEL_MISSING_ERROR_CODE = 'ocr-model-missing';

export interface MercuryStructuredErrorResponse {
  success: false;
  code?: string;
  details?: Record<string, unknown>;
  error?: string;
}

export class MercuryClientError extends Error {
  constructor(
    public readonly code: string,
    public readonly details: Record<string, unknown> = {},
  ) {
    super(code);
    this.name = 'MercuryClientError';
  }
}

export function createOcrModelMissingError(languages: readonly string[]): MercuryClientError {
  return new MercuryClientError(OCR_MODEL_MISSING_ERROR_CODE, { languages: [...languages] });
}

export function isMercuryClientError(error: unknown): error is MercuryClientError {
  return error instanceof MercuryClientError;
}

function formatMessage(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (message, [key, value]) => message.replaceAll(`{${key}}`, value),
    template,
  );
}

function getLanguageList(details: Record<string, unknown> | undefined): string {
  const languages = Array.isArray(details?.languages)
    ? details.languages.filter((language): language is string => typeof language === 'string' && language.trim().length > 0)
    : [];
  return languages.length ? languages.join(', ') : 'OCR';
}

export function localizeStructuredErrorResponse(
  response: unknown,
  fallbackPath: MessagePath,
  locale: UiLocale = detectUiLocale(),
): Error {
  const translate = createTranslator(locale);
  if (response && typeof response === 'object') {
    const value = response as MercuryStructuredErrorResponse;
    if (value.code === OCR_MODEL_MISSING_ERROR_CODE) {
      return new Error(formatMessage(translate('error.ocrModelMissing'), {
        languages: getLanguageList(value.details),
      }));
    }
    if (typeof value.error === 'string' && value.error) return new Error(value.error);
  }
  return new Error(translate(fallbackPath));
}

export async function localizeStructuredErrorResponseFromPreference(
  response: unknown,
  fallbackPath: MessagePath,
): Promise<Error> {
  try {
    const { getStoredUiLocalePreference, resolveUiLocalePreference } = await import('./preferences');
    return localizeStructuredErrorResponse(
      response,
      fallbackPath,
      resolveUiLocalePreference(await getStoredUiLocalePreference()),
    );
  } catch {
    return localizeStructuredErrorResponse(response, fallbackPath);
  }
}
