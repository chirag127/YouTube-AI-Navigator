import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../../../extension/background/services.js', () => ({
    initializeServices: vi.fn(),
    getServices: vi.fn(),
}));

vi.mock('../../../extension/background/utils/api-key.js', () => ({
    getApiKey: vi.fn(),
}));

import { handleSaveChatMessage } from '../../../extension/background/handlers/chat-history.js';

describe('handleSaveChatMessage', () => {
    let mockInitializeServices, mockGetServices, mockGetApiKey, mockStorage, mockRsp;

    beforeEach(() => {
        vi.clearAllMocks();
        mockInitializeServices = vi.mocked(require('../../../extension/background/services.js').initializeServices);
        mockGetServices = vi.mocked(require('../../../extension/background/services.js').getServices);
        mockGetApiKey = vi.mocked(require('../../../extension/background/utils/api-key.js').getApiKey);
        mockStorage = { saveChatMessage: vi.fn() };
        mockGetServices.mockReturnValue({ storage: mockStorage });
        mockRsp = vi.fn();
    });

    it('should save chat message successfully', async () => {
        const req = { videoId: 'vid1', message: 'test msg' };
        mockGetApiKey.mockResolvedValue('key');
        mockInitializeServices.mockResolvedValue();
        mockStorage.saveChatMessage.mockResolvedValue();

        await handleSaveChatMessage(req, mockRsp);

        expect(mockGetApiKey).toHaveBeenCalled();
        expect(mockInitializeServices).toHaveBeenCalledWith('key');
        expect(mockStorage.saveChatMessage).toHaveBeenCalledWith('vid1', 'test msg');
        expect(mockRsp).toHaveBeenCalledWith({ success: true });
    });

    it('should handle no apiKey', async () => {
        const req = { videoId: 'vid1', message: 'test' };
        mockGetApiKey.mockResolvedValue(null);

        await handleSaveChatMessage(req, mockRsp);

        expect(mockStorage.saveChatMessage).not.toHaveBeenCalled();
        expect(mockRsp).toHaveBeenCalledWith({ success: true });
    });

    it('should handle no storage', async () => {
        const req = { videoId: 'vid1', message: 'test' };
        mockGetApiKey.mockResolvedValue('key');
        mockInitializeServices.mockResolvedValue();
        mockGetServices.mockReturnValue({ storage: null });

        await handleSaveChatMessage(req, mockRsp);

        expect(mockStorage.saveChatMessage).not.toHaveBeenCalled();
        expect(mockRsp).toHaveBeenCalledWith({ success: true });
    });
});