import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../../../extension/utils/shortcuts/storage.js', () => ({
    slg: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/log.js', () => ({
    e: vi.fn(),
}));

import { getApiKey } from '../../../extension/background/utils/api-key.js';

describe('getApiKey', () => {
    let mockSlg, mockE;

    beforeEach(() => {
        vi.clearAllMocks();
        mockSlg = vi.mocked(require('../../../extension/utils/shortcuts/storage.js').slg);
        mockE = vi.mocked(require('../../../extension/utils/shortcuts/log.js').e);
    });

    it('should return apiKey', async () => {
        mockSlg.mockResolvedValue({ GAK: 'test-key' });

        const result = await getApiKey();

        expect(result).toBe('test-key');
    });

    it('should return null if no key', async () => {
        mockSlg.mockResolvedValue({});

        const result = await getApiKey();

        expect(result).toBeNull();
    });

    it('should return null on error', async () => {
        mockSlg.mockRejectedValue(new Error('Storage error'));

        const result = await getApiKey();

        expect(mockE).toHaveBeenCalledWith('Err:GetApiKey', expect.any(Error));
        expect(result).toBeNull();
    });
});