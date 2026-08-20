import {readFileSync} from 'node:fs';
import {describe, expect, it} from 'vitest';

const template = readFileSync(new URL('../entrypoints/pdf-viewer/App.vue', import.meta.url), 'utf8');

describe('PDF viewer template', () => {
  it('keeps PDF panes mounted while local provider preparation is gated', () => {
    expect(template).toContain('class="pdf-panes"');
    expect(template).not.toContain('v-else-if="localProviderGateVisible" class="pdf-state pdf-provider-state"');
    expect(template).toContain('<section v-if="localProviderGateVisible" class="pdf-provider-state"');
  });
});
