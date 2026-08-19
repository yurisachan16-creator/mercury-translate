import {beforeEach, describe, expect, it, vi} from 'vitest';

const permissionMocks = vi.hoisted(() => ({
  contains: vi.fn(),
  request: vi.fn(),
}));

vi.mock('webextension-polyfill', () => ({
  default: {permissions: permissionMocks},
}));

import {
  getProviderHostPermissions,
  hostPermissionPattern,
  requestHostPermissions,
} from '@/entrypoints/utils/providerPermissions';
import {Config} from '@/entrypoints/utils/model';

describe('provider host permissions', () => {
  beforeEach(() => {
    permissionMocks.contains.mockReset().mockResolvedValue(false);
    permissionMocks.request.mockReset().mockResolvedValue(true);
  });

  it('reduces configured endpoints to exact origin patterns', () => {
    expect(hostPermissionPattern('https://api.example.test:8443/v1/chat')).toBe('https://api.example.test:8443/*');
    expect(hostPermissionPattern('file:///tmp/model')).toBeNull();

    const current = new Config();
    current.custom = 'http://127.0.0.1:11434/v1/chat/completions';
    expect(getProviderHostPermissions('custom', current)).toEqual(['http://127.0.0.1:11434/*']);
  });

  it('requests only missing origins', async () => {
    await expect(requestHostPermissions(['https://api.example.test/*'])).resolves.toBe(true);
    expect(permissionMocks.contains).toHaveBeenCalledWith({origins: ['https://api.example.test/*']});
    expect(permissionMocks.request).toHaveBeenCalledWith({origins: ['https://api.example.test/*']});
  });
});
