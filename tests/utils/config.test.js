import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../../extension/utils/shortcuts/storage.js', () => ({
    sg: vi.fn(),
    ss: vi.fn(),
}));

vi.mock('../../extension/utils/shortcuts/core.js', () => ({
    nw: vi.fn(() => 1234567890),
    jp: vi.fn(),
    js: vi.fn(JSON.stringify),
}));

vi.mock('../../extension/utils/shortcuts/array.js', () => ({
    isa: vi.fn(Array.isArray),
}));

// Import after mocks
import { DC, ConfigManager, getCfg } from '../../extension/utils/config.js';

describe('ConfigManager', () => {
    let manager;
    let mockSg, mockSs, mockNw, mockJp, mockJs, mockIsa;

    beforeEach(() => {
        vi.clearAllMocks();
        manager = new ConfigManager();

        mockSg = vi.mocked(require('../../extension/utils/shortcuts/storage.js').sg);
        mockSs = vi.mocked(require('../../extension/utils/shortcuts/storage.js').ss);
        mockNw = vi.mocked(require('../../extension/utils/shortcuts/core.js').nw);
        mockJp = vi.mocked(require('../../extension/utils/shortcuts/core.js').jp);
        mockJs = vi.mocked(require('../../extension/utils/shortcuts/core.js').js);
        mockIsa = vi.mocked(require('../../extension/utils/shortcuts/array.js').isa);
    });

    describe('constructor', () => {
        it('should initialize with default config', () => {
            expect(manager.c).toEqual(DC);
            expect(manager.l).toEqual([]);
        });
    });

    describe('load', () => {
        it('should load saved config and merge with defaults', async () => {
            const savedConfig = { ai: { k: 'saved-key' } };
            mockSg.mockResolvedValue({ cfg: savedConfig });

            const result = await manager.load();

            expect(mockSg).toHaveBeenCalledWith('cfg');
            expect(result.ai.k).toBe('saved-key');
            expect(result.ui.th).toBe('dark'); // from defaults
        });

        it('should use defaults when no saved config', async () => {
            mockSg.mockResolvedValue({});

            const result = await manager.load();

            expect(result).toEqual(DC);
        });
    });

    describe('save', () => {
        it('should save config with updated timestamp', async () => {
            mockSs.mockResolvedValue();

            await manager.save();

            expect(mockNw).toHaveBeenCalled();
            expect(manager.c._m.lu).toBe(1234567890);
            expect(mockSs).toHaveBeenCalledWith('cfg', manager.c);
        });
    });

    describe('get', () => {
        it('should return full config when no path', () => {
            expect(manager.get()).toEqual(manager.c);
        });

        it('should return nested value by path', () => {
            expect(manager.get('ai.k')).toBe('');
            expect(manager.get('ui.th')).toBe('dark');
        });

        it('should return undefined for invalid path', () => {
            expect(manager.get('invalid.path')).toBeUndefined();
        });
    });

    describe('set', () => {
        it('should set nested value', () => {
            manager.set('ai.k', 'new-key');

            expect(manager.c.ai.k).toBe('new-key');
        });

        it('should create nested objects', () => {
            manager.set('new.deep.value', 42);

            expect(manager.c.new.deep.value).toBe(42);
        });
    });

    describe('update', () => {
        it('should set and save', async () => {
            mockSs.mockResolvedValue();

            await manager.update('ai.k', 'updated-key');

            expect(manager.c.ai.k).toBe('updated-key');
            expect(mockSs).toHaveBeenCalled();
        });
    });

    describe('reset', () => {
        it('should reset to defaults and save', async () => {
            manager.c.ai.k = 'modified';
            mockSs.mockResolvedValue();

            await manager.reset();

            expect(manager.c).toEqual(DC);
            expect(mockSs).toHaveBeenCalled();
        });
    });

    describe('sub and nt', () => {
        it('should manage subscribers', () => {
            const callback = vi.fn();
            manager.sub(callback);

            expect(manager.l).toContain(callback);

            manager.nt();

            expect(callback).toHaveBeenCalledWith(manager.c);
        });
    });

    describe('mg (merge)', () => {
        it('should merge objects deeply', () => {
            const defaults = { a: 1, b: { c: 2 } };
            const saved = { b: { d: 3 }, e: 4 };

            const result = manager.mg(defaults, saved);

            expect(result).toEqual({ a: 1, b: { c: 2, d: 3 }, e: 4 });
        });

        it('should handle arrays', () => {
            mockIsa.mockReturnValue(true);
            const defaults = { arr: [1, 2] };
            const saved = { arr: [3, 4] };

            const result = manager.mg(defaults, saved);

            expect(result.arr).toEqual([3, 4]);
        });
    });

    describe('exp', () => {
        it('should export config as JSON', () => {
            mockJs.mockReturnValue('{"test": "data"}');

            const result = manager.exp();

            expect(mockJs).toHaveBeenCalledWith(manager.c);
            expect(result).toBe('{"test": "data"}');
        });
    });

    describe('imp', () => {
        it('should import valid JSON and save', async () => {
            const json = '{"ai": {"k": "imported"}}';
            mockJp.mockReturnValue({ ai: { k: 'imported' } });
            mockSs.mockResolvedValue();

            const result = await manager.imp(json);

            expect(result).toBe(1);
            expect(manager.c.ai.k).toBe('imported');
            expect(mockSs).toHaveBeenCalled();
        });

        it('should return 0 for invalid JSON', async () => {
            mockJp.mockImplementation(() => { throw new Error('Invalid JSON'); });

            const result = await manager.imp('invalid');

            expect(result).toBe(0);
        });
    });
});

describe('getCfg', () => {
    it('should return singleton instance', () => {
        const cfg1 = getCfg();
        const cfg2 = getCfg();

        expect(cfg1).toBeInstanceOf(ConfigManager);
        expect(cfg1).toBe(cfg2);
    });
});

describe('DC (Default Config)', () => {
    it('should have all required sections', () => {
        expect(DC).toHaveProperty('ca');
        expect(DC).toHaveProperty('sc');
        expect(DC).toHaveProperty('tr');
        expect(DC).toHaveProperty('co');
        expect(DC).toHaveProperty('md');
        expect(DC).toHaveProperty('ui');
        expect(DC).toHaveProperty('ai');
        expect(DC).toHaveProperty('au');
        expect(DC).toHaveProperty('sg');
        expect(DC).toHaveProperty('ex');
        expect(DC).toHaveProperty('ad');
        expect(DC).toHaveProperty('_m');
    });
});