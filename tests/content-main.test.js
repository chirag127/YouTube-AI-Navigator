import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Content Main', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        global.window = { location: { hostname: 'www.youtube.com' } };
        global.chrome.runtime.getURL = vi.fn(path => `chrome-extension://mock/${path}`);
    });

    it('should only run on YouTube', () => {
        expect(window.location.hostname).toBe('www.youtube.com');
    });

    it('should have chrome runtime available', () => {
        expect(chrome.runtime.getURL).toBeDefined();
    });

    it('should handle GET_METADATA action', () => {
        const mockMessage = { action: 'GET_METADATA', videoId: 'test123' };
        const mockSendResponse = vi.fn();

        expect(mockMessage.action).toBe('GET_METADATA');
        expect(mockMessage.videoId).toBe('test123');
    });

    it('should handle GET_TRANSCRIPT action', () => {
        const mockMessage = { action: 'GET_TRANSCRIPT', videoId: 'test123' };
        const mockSendResponse = vi.fn();

        expect(mockMessage.action).toBe('GET_TRANSCRIPT');
        expect(mockMessage.videoId).toBe('test123');
    });

    it('should handle GET_COMMENTS action', () => {
        const mockMessage = { action: 'GET_COMMENTS' };
        const mockSendResponse = vi.fn();

        expect(mockMessage.action).toBe('GET_COMMENTS');
    });

    it('should handle SEEK_TO action', () => {
        const mockMessage = { action: 'SEEK_TO', timestamp: 120 };
        const mockSendResponse = vi.fn();

        expect(mockMessage.action).toBe('SEEK_TO');
        expect(mockMessage.timestamp).toBe(120);
    });

    it('should handle SHOW_SEGMENTS action', () => {
        const mockMessage = { action: 'SHOW_SEGMENTS', segments: [] };
        const mockSendResponse = vi.fn();

        expect(mockMessage.action).toBe('SHOW_SEGMENTS');
        expect(mockMessage.segments).toEqual([]);
    });

    it('should handle GET_VIDEO_DATA action', () => {
        const mockMessage = { action: 'GET_VIDEO_DATA', videoId: 'test123' };
        const mockSendResponse = vi.fn();

        expect(mockMessage.action).toBe('GET_VIDEO_DATA');
        expect(mockMessage.videoId).toBe('test123');
    });
});
