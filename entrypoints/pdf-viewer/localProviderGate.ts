import {services} from '@/entrypoints/utils/option';
import type {ProviderRuntimeAvailability} from '@/entrypoints/types/pdf';

export function shouldGatePdfLocalProvider(
  providerId: string,
  availability: ProviderRuntimeAvailability | null,
  gestureArmed: boolean,
): boolean {
  if (providerId !== services.chromeTranslator) return false;
  if (gestureArmed) return false;
  return availability !== 'ready';
}

export function canPreparePdfLocalProvider(availability: ProviderRuntimeAvailability | null): boolean {
  return availability === 'downloadable' || availability === 'after-detection';
}
