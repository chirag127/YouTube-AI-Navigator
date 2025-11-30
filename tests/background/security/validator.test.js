import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mocks
vi.mock('../../../extension/utils/shortcuts/core.js', () => ({
    js: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/string.js', () => ({
    rp: vi.fn(),
}));

vi.mock('../../../extension/utils/shortcuts/array.js', () => ({
    isa: vi.fn(),
}));

import {
    validateMessage,
    sanitizeVideoId,
    sanitizeString,
    validateTranscript,
    sanitizeRequest,
} from '../../../extension/background/security/validator.js';

describe('validateMessage', () => {
    it('should validate allowed action', () => {
        const result = validateMessage({ action: 'GET_SETTINGS' });

        expect(result).toEqual({ valid: true });
    });

    it('should invalidate unknown action', () => {
        const result = validateMessage({ action: 'UNKNOWN' });

        expect(result).toEqual({ valid: false, error: 'Invalid action' });
    });

    it('should handle type instead of action', () => {
        const result = validateMessage({ type: 'ANALYZE_VIDEO' });

        expect(result).toEqual({ valid: true });
    });
});

describe('sanitizeVideoId', () => {
    it('should sanitize valid videoId', () => {
        const result = sanitizeVideoId('dQw4w9WgXcQ');

        expect(result).toBe('dQw4w9WgXcQ');
    });

    it('should sanitize long videoId', () => {
        const result = sanitizeVideoId('dQw4w9WgXcQextra');

        expect(result).toBe('dQw4w9WgXcQ');
    });

    it('should return null for invalid', () => {
        const result = sanitizeVideoId('invalid');

        expect(result).toBeNull();
    });

    it('should return null for non-string', () => {
        const result = sanitizeVideoId(123);

        expect(result).toBeNull();
    });
});

describe('sanitizeString', () => {
    let mockRp;

    beforeEach(() => {
        mockRp = vi.mocked(require('../../../extension/utils/shortcuts/string.js').rp);
        mockRp.mockImplementation((str, regex, repl) => str.replace(regex, repl));
    });

    it('should sanitize string', () => {
        const result = sanitizeString('<script>alert(1)</script>Hello', 10);

        expect(result).toBe('alert(1)Hel');
    });

    it('should return empty for non-string', () => {
        const result = sanitizeString(null);

        expect(result).toBe('');
    });
});

describe('validateTranscript', () => {
    let mockIsa, mockJs;

    beforeEach(() => {
        mockIsa = vi.mocked(require('../../../extension/utils/shortcuts/array.js').isa);
        mockJs = vi.mocked(require('../../../extension/utils/shortcuts/core.js').js);
        mockIsa.mockReturnValue(true);
        mockJs.mockReturnValue('{"test":"data"}');
    });

    it('should validate valid transcript', () => {
        const transcript = [{ start: 0, text: 'Hello' }];
        mockIsa.mockReturnValue(true);

        const result = validateTranscript(transcript);

        expect(result).toBe(true);
    });

    it('should invalidate non-array', () => {
        mockIsa.mockReturnValue(false);

        const result = validateTranscript('not array');

        expect(result).toBe(false);
    });

    it('should invalidate too large', () => {
        const transcript = [{ start: 0, text: 'a'.repeat(6000000) }];
        mockJs.mockReturnValue('a'.repeat(6000000));

        const result = validateTranscript(transcript);

        expect(result).toBe(false);
    });

    it('should invalidate invalid structure', () => {
        const transcript = [{ start: '0', text: 123 }];

        const result = validateTranscript(transcript);

        expect(result).toBe(false);
    });
});

describe('sanitizeRequest', () => {
    it('should sanitize request fields', () => {
        const req = {
            videoId: 'dQw4w9WgXcQextra',
            question: '<script>hack</script>What?',
            title: 'Title<script>',
            summary: 'Summary'.repeat(1000),
        };

        const result = sanitizeRequest(req);

        expect(result.videoId).toBe('dQw4w9WgXcQ');
        expect(result.question).toContain('hack'); // since sanitizeString removes <>
        expect(result.title).toBe('Title');
        expect(result.summary.length).toBeLessThan(50000);
    });
});