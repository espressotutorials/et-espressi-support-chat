import { EnvironmentCollectorService } from './environment-collector.service';

describe('EnvironmentCollectorService', () => {
  it('collects only allow-listed values and strips query and fragment from the page URL', () => {
    const result = new EnvironmentCollectorService().collect({ apiBaseUrl: '', platform: 'et', vectorStoreId: 'vs', language: 'de', product: 'et.training' });
    expect(result.url).not.toContain('?'); expect(result.url).not.toContain('#'); expect(result.product).toBe('et.training');
    expect(Object.keys(result).sort()).toEqual(['browser_user', 'mobile', 'platform', 'product', 'system', 'url'].sort().concat(result.connection ? ['connection'] : []).sort());
  });
});
